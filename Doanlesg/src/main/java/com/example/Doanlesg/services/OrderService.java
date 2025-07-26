package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.*;
import com.example.Doanlesg.model.*;
import com.example.Doanlesg.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final ProductRepository productRepository;
    private final OderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ShippingRepository shippingRepository;
    private final InvoiceService invoiceService;
    private final GhnApiService ghnApiService;
    private final ObjectMapper objectMapper;
    private final TransactionalOrderService transactionalOrderService;
    private final PostmarkEmailService emailService;

    public OrderService(OrderRepository orderRepository, AccountRepository accountRepository, ProductRepository productRepository, OderItemRepository orderItemRepository, PaymentRepository paymentRepository, ShippingRepository shippingRepository, InvoiceService invoiceService, GhnApiService ghnApiService, ObjectMapper objectMapper, TransactionalOrderService transactionalOrderService, PostmarkEmailService emailService) {
        this.orderRepository = orderRepository;
        this.accountRepository = accountRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.shippingRepository = shippingRepository;
        this.invoiceService = invoiceService;
        this.transactionalOrderService = transactionalOrderService;
        this.ghnApiService = ghnApiService;
        this.objectMapper = objectMapper;
        this.emailService = emailService;
    }


    @Transactional
    public void placeOrder(CheckoutRequestDTO request, String code) {
        Order order = new Order();
        // 1. Xác định người đặt hàng (Customer hay Guest)
        if (request.getCustomerId() != null) {
            // Là khách hàng đã đăng nhập
            Optional<Account> customer = accountRepository.findById(request.getCustomerId());
            customer.ifPresent(order::setAccount);
            order.setReceiverEmail(request.getGuestEmail());
        } else {
            // Là khách vãng lai
            order.setAccount(null);
            if (request.getGuestEmail() == null || request.getGuestEmail().isBlank()) {
                throw new IllegalArgumentException("Guest email cannot be null or empty.");
            } else
                order.setReceiverEmail(request.getGuestEmail());
        }
        order.setReceiverFullName(request.getGuestName());
        order.setReceiverPhoneNumber(request.getGuestPhone());
        order.setFullShippingAddress(request.getGuestAddress()); // Giả sử có địa chỉ mặc định
        order.setPaymentMethod(paymentRepository.findById(request.getPaymentMethodId()).orElse(null));
        order.setShippingMethod(shippingRepository.findById(request.getShippingMethodId()).orElse(null));
        order.setCode(code);

        // 2. Thiết lập các thông tin chung cho đơn hàng
        order.setOrderDate(new Date().toInstant());
        order.setOrderStatus("Pending"); // Trạng thái ban đầu
        // ... set shippingMethod, paymentMethod từ request.get...Id()
        // 3. Xử lý các mặt hàng trong đơn
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItemDTO itemDTO : request.getItems()) {

            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
            BigDecimal total = product.getPrice().multiply(new BigDecimal(itemDTO.getQuantity()));
            OrderItem orderItem = new OrderItem();

            orderItem.setProduct(product);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setUnitPrice(product.getPrice()); // Lấy giá từ DB để đảm bảo chính xác
            orderItem.setOrder(order);
            orderItem.setTotal(total);
            orderItems.add(orderItem);
            totalAmount = totalAmount.add(total);
            // 1. Kiểm tra xem số lượng tồn kho có đủ không
            if (product.getStockQuantity() < itemDTO.getQuantity()) {
                throw new RuntimeException("Sản phẩm '" + product.getProductName() + "' không đủ số lượng tồn kho.");
            }
            // 2. Trừ số lượng tồn kho
            int newQuantityInStock = product.getStockQuantity() - itemDTO.getQuantity();
            product.setStockQuantity(newQuantityInStock);
            productRepository.save(product); // Lưu lại thông tin sản phẩm đã cập nhật
        }

        ShippingMethod shippingMethod = shippingRepository.findById(request.getShippingMethodId()).orElse(null);

        order.setOrderItems(orderItems);
        assert shippingMethod != null;
        order.setTotalAmount(totalAmount.add(BigDecimal.valueOf(shippingMethod.getPrice()))); // Tạm tính, chưa có phí voucher

        // TODO: Thêm logic tính áp dụng voucher ở đây để ra tổng cuối cùng

        orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);

        final long GHN_SHIPPING_METHOD_ID = 2L;

        if (request.getShippingMethodId() == GHN_SHIPPING_METHOD_ID) {
            try {
                // Gọi một phương thức private mới để xử lý logic GHN
                registerShipmentWithGhn(order, request);
            } catch (Exception e) {
                // Ghi log lỗi nếu việc gọi GHN thất bại
                logger.error("Đăng ký vận đơn GHN thất bại cho order code: {}. Lỗi: {}",
                        order.getCode(), e.getMessage());
            }
        }

        // 4. Lưu đơn hàng và các mặt hàng liên quan
    }

    /// tam thoi chua su dung
    private void registerShipmentWithGhn(Order order, CheckoutRequestDTO request) {
        GhnCreateOrderRequest ghnRequest = new GhnCreateOrderRequest();

        // 1. Map các thông tin cơ bản
        ghnRequest.setToName(order.getReceiverFullName());
        ghnRequest.setToPhone(order.getReceiverPhoneNumber());
        ghnRequest.setToAddress(order.getFullShippingAddress());
        ghnRequest.setToWardCode(request.getGuestWardCode());
        ghnRequest.setToDistrictId(request.getGuestDistrictId().intValue()); // Đã sửa lỗi .intValue() không cần thiết

        ghnRequest.setServiceId(0);
        ghnRequest.setServiceTypeId(2);

        int totalWeight = request.getItems().stream().mapToInt(item -> item.getQuantity() * 200).sum();
        ghnRequest.setWeight(totalWeight);
        ghnRequest.setHeight(10);
        ghnRequest.setLength(20);
        ghnRequest.setWidth(15);

        final long CASH_PAYMENT_METHOD_ID = 1L; // Giả sử ID của "Cash On Delivery" là 1
        if (request.getPaymentMethodId() == CASH_PAYMENT_METHOD_ID) {
            ghnRequest.setCodAmount(order.getTotalAmount().intValue());
        } else {
            ghnRequest.setCodAmount(0);
        }

        ghnRequest.setContent("Order " + order.getCode());
        ghnRequest.setPaymentTypeId(2);
        ghnRequest.setNote(order.getNotes());
        ghnRequest.setRequiredNote("CHOXEMHANGKHONGTHU");

        // 2. TẠO DANH SÁCH SẢN PHẨM (ITEMS) MỘT CÁCH AN TOÀN
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            logger.error("Danh sách sản phẩm (OrderItems) bị rỗng cho order code: {}", order.getCode());
            return;
        }

        List<GhnItemDTO> ghnItems = order.getOrderItems().stream()
                .map(orderItem -> {
                    GhnItemDTO ghnItem = new GhnItemDTO();
                    Product product = orderItem.getProduct();

                    ghnItem.setName(product.getProductName());
                    // Kiểm tra null cho mã sản phẩm
                    String productCode = product.getId().toString();
                    ghnItem.setCode(productCode);
                    ghnItem.setQuantity(orderItem.getQuantity());
                    ghnItem.setPrice(orderItem.getUnitPrice().intValue());

                    GhnCategoryDTO category = new GhnCategoryDTO();
                    // KIỂM TRA NULL CHO CATEGORY - ĐIỂM QUAN TRỌNG NHẤT
                    if (product.getCategory() != null && product.getCategory().getCategoryName() != null) {
                        category.setLevel1(product.getCategory().getCategoryName());
                    } else {
                        category.setLevel1("Sản phẩm khác"); // Cung cấp một giá trị mặc định an toàn
                    }
                    ghnItem.setCategory(category);

                    return ghnItem;
                })
                .collect(Collectors.toList()); // Dùng .collect() để tương thích rộng hơn

        ghnRequest.setItems(ghnItems);

        // 3. Ghi log và gọi API
        try {
            logger.info("Đang gửi yêu cầu đến GHN (phiên bản cuối): {}", this.objectMapper.writeValueAsString(ghnRequest));
        } catch (Exception e) {
            logger.error("Không thể serialize ghnRequest", e);
        }

        // Gọi GhnApiService bạn đã tạo
        ghnApiService.createOrder(ghnRequest).subscribe(
                ghnResponse -> {
                    logger.info("Response nhận được từ GHN: {}", ghnResponse);

                    // SỬA Ở ĐÂY: Truy cập qua ghnResponse.getData()
                    if (ghnResponse == null || ghnResponse.getData() == null || ghnResponse.getData().getOrderCode() == null) {
                        logger.error("GHN đã trả về response thành công nhưng KHÔNG CÓ MÃ VẬN ĐƠN. Order Code của bạn: {}", order.getCode());
                        return;
                    }

                    try {
                        // SỬA Ở ĐÂY: Lấy mã vận đơn từ đối tượng lồng nhau
                        String trackingCode = ghnResponse.getData().getOrderCode();

                        Map<String, String> shipmentInfo = Map.of(
                                "carrier", "GHN",
                                "tracking_code", trackingCode
                        );

                        String shipmentInfoJson = this.objectMapper.writeValueAsString(shipmentInfo);
                        order.setNotes(shipmentInfoJson);
                        orderRepository.save(order);

                        logger.info("!!! THÀNH CÔNG: Đã đăng ký và lưu mã vận đơn GHN {} cho order code {}", trackingCode, order.getCode());
                    } catch (Exception e) {
                        // Lỗi này chỉ xảy ra nếu có vấn đề với việc chuyển đổi JSON hoặc lưu DB
                        logger.error("Lỗi khi xử lý response thành công từ GHN. Order Code: {}", order.getCode(), e);
                    }
                },
                error -> {
                    // Xử lý lỗi khi gọi API GHN (ví dụ: thiếu thông tin, sai địa chỉ)
                    logger.error("Lỗi khi gọi API GHN cho order code {}: {}", order.getCode(), error.getMessage());
                }
        );
    }

    public void processPaidOrder(String uniqueCode, boolean flag) throws IOException {
        // Find the order using the unique payment code
        Order updatedOrder = transactionalOrderService.updateOrderStatus(uniqueCode, flag);
        if (updatedOrder != null && ("Paid".equals(updatedOrder.getOrderStatus()) || "Cash".equals(updatedOrder.getOrderStatus()))) {

            List<InvoiceData.Item> items = updatedOrder.getOrderItems().stream()
                    .map(orderItem -> new InvoiceData.Item(
                            orderItem.getProduct().getProductName(),
                            orderItem.getQuantity(),
                            orderItem.getUnitPrice().doubleValue()
                    ))
                    .toList();

            InvoiceData invoiceData = new InvoiceData(
                    updatedOrder.getCode(), // Assuming order code is the invoice number
                    updatedOrder.getOrderDate().toString(), // Or format it as needed
                    "Công ty Dole Saigon\n123 ABC, Q1, TPHCM",
                    updatedOrder.getReceiverFullName() + "\n" + updatedOrder.getFullShippingAddress(),
                    items,
                    updatedOrder.getTotalAmount().doubleValue(),
                    invoiceService.getLogoAsBase64() // Logo will be added by InvoiceService
            );

            // 3. Send the invoice email
            try {
                emailService.sendOrderConfirmationEmail(updatedOrder, invoiceService.generateInlinedInvoiceHtml(invoiceData));
            } catch (Exception e) {
                // Log the error but don't stop the process, as the order is already paid
                logger.error("Failed to send invoice email for order code {}: {}", uniqueCode, e.getMessage());
            }
        }
        // 4. Stop tracking this code as it's now processed
    }

    public OrderTotalDTO calculateTotal(CheckoutRequestDTO request) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        // 1. Tính tổng tiền các sản phẩm
        for (CartItemDTO itemDTO : request.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
            totalAmount = totalAmount.add(product.getPrice().multiply(new BigDecimal(itemDTO.getQuantity())));
        }

        ShippingMethod shippingMethod = shippingRepository.findById(request.getShippingMethodId()).orElse(null);

        // 2. Cộng phí vận chuyển
        // Giả sử phí vận chuyển được gửi trực tiếp từ request
        if (shippingMethod != null) {
            totalAmount = totalAmount.add(BigDecimal.valueOf(shippingMethod.getPrice()));
        }
        // TODO: Thêm logic trừ tiền voucher nếu có
        // Ví dụ:
        // if (request.getVoucherCode() != null) {
        //     Voucher voucher = voucherRepository.findByCode(request.getVoucherCode());
        //     totalAmount = totalAmount.subtract(voucher.getDiscountAmount());
        // }

        OrderTotalDTO orderTotalDTO = new OrderTotalDTO();
        orderTotalDTO.setTotalAmount(totalAmount);

        return orderTotalDTO;
    }

    public Optional<Order> findOrderByPaymentCode(String code) {
        return orderRepository.findByCode(code);
    }

    public List<OrderSummaryDTO> findOrdersByAccountId(Long accountId) {
        // 1. Fetch the full Order objects
        List<Order> orders = orderRepository.findAllByAccountIdOrderByOrderDateDesc(accountId);
//        System.out.println(orders);
        // 2. Manually convert (map) each Order to an OrderSummaryDTO
        return orders.stream()
                .map(this::convertToSummaryDTO) // You would create this helper method
                .toList();
    }

    // Helper method to perform the conversion
    private OrderSummaryDTO convertToSummaryDTO(Order order) {
        OrderSummaryDTO dto = new OrderSummaryDTO();
        dto.setId(order.getId());
        dto.setOrderCode(order.getCode());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setOrderStatus(order.getOrderStatus());
        return dto;
    }

    /**
     * Finds an order by its ID and converts it to a detailed DTO.
     * Includes a security check to ensure the user owns the order.
     * @param orderId The ID of the order to find.
     * @param accountId The ID of the currently logged-in user from the session.
     * @return An OrderDetailDTO if found and authorized, otherwise null.
     */
    public OrderDetailDTO findOrderDetailsByIdForAccount(Integer orderId, Long accountId) {
        // 1. Fetch the order and its related items from the database
        Order order = orderRepository.findById(orderId).orElse(null);

        // 2. Security Check:
        // Return null if the order doesn't exist, or if the user doesn't own it.
        if (order == null || order.getAccount() == null || !order.getAccount().getId().equals(accountId)) {
            return null;
        }

        // 3. If authorized, convert the Order entity to an OrderDetailDTO
        OrderDetailDTO dto = new OrderDetailDTO();

        // --- Basic Info ---
        dto.setId(order.getId());
        dto.setOrderCode(order.getCode());
        dto.setOrderDate(order.getOrderDate());
        dto.setOrderStatus(order.getOrderStatus());

        // --- Receiver & Shipping Info ---
        dto.setReceiverFullName(order.getReceiverFullName());
        dto.setReceiverEmail(order.getReceiverEmail());
        dto.setReceiverPhoneNumber(order.getReceiverPhoneNumber());
        dto.setFullShippingAddress(order.getFullShippingAddress());
        dto.setNotes(order.getNotes());

        // --- Method Names (Safely check for nulls) ---
        dto.setPaymentMethodName(order.getPaymentMethod() != null ? order.getPaymentMethod().getMethodName() : "N/A");
        dto.setShippingMethodName(order.getShippingMethod() != null ? order.getShippingMethod().getMethodName() : "N/A");

        // --- Map the list of OrderItem entities to a list of OrderItemDTOs ---
        List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> new OrderItemDTO(
                        item.getProduct().getId(),
                        item.getProduct().getProductName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getTotal()
                ))
                .collect(Collectors.toList());
        dto.setOrderItems(itemDTOs);

        // --- Financial Breakdown ---
        // Calculate the subtotal from the items list
        BigDecimal itemsSubtotal = itemDTOs.stream()
                .map(OrderItemDTO::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setItemsSubtotal(itemsSubtotal);

        // Set other financial details from the order
        // You might need to add these fields (e.g., shippingFee, voucherDiscount) to your Order entity
        dto.setShippingFee(order.getShippingMethod() != null ? BigDecimal.valueOf(order.getShippingMethod().getPrice()) : BigDecimal.ZERO);
        dto.setVoucherDiscount(order.getVoucher() != null ? BigDecimal.valueOf(order.getVoucher().getDiscountAmount()) : BigDecimal.ZERO);
        dto.setTotalAmount(order.getTotalAmount());

        return dto;
    }
}