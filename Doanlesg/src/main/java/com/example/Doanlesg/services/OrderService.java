package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.*;
import com.example.Doanlesg.model.*;
import com.example.Doanlesg.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final QRCodeManagermentService qrCodeManager;
    private final GhnApiService ghnApiService;
    private final ObjectMapper objectMapper;

    public OrderService(OrderRepository orderRepository, AccountRepository accountRepository, ProductRepository productRepository, OderItemRepository orderItemRepository, PaymentRepository paymentRepository, ShippingRepository shippingRepository, InvoiceService invoiceService, QRCodeManagermentService qrCodeManagermentService, GhnApiService ghnApiService, ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.accountRepository = accountRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.shippingRepository = shippingRepository;
        this.invoiceService = invoiceService;
        this.qrCodeManager = qrCodeManagermentService;
        this.ghnApiService = ghnApiService;
        this.objectMapper = objectMapper;
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

//        final long GHN_SHIPPING_METHOD_ID = 2L;
//
//        if (request.getShippingMethodId() == GHN_SHIPPING_METHOD_ID) {
//            try {
//                // Gọi một phương thức private mới để xử lý logic GHN
//                registerShipmentWithGhn(order, request);
//            } catch (Exception e) {
//                // Ghi log lỗi nếu việc gọi GHN thất bại
//                logger.error("Đăng ký vận đơn GHN thất bại cho order code: {}. Lỗi: {}",
//                        order.getCode(), e.getMessage());
//            }
//        }

        // 4. Lưu đơn hàng và các mặt hàng liên quan
    }

    /// tam thoi chua su dung
    private void registerShipmentWithGhn(Order order, CheckoutRequestDTO request) {
        GhnCreateOrderRequest ghnRequest = new GhnCreateOrderRequest();

        // Map thông tin từ các đối tượng của bạn sang GhnCreateOrderRequest
        ghnRequest.setToName(order.getReceiverFullName());
        ghnRequest.setToPhone(order.getReceiverPhoneNumber());
        ghnRequest.setToAddress(order.getFullShippingAddress());

        // Tính toán cân nặng, kích thước (đây là ví dụ, bạn cần logic thực tế hơn)
        int totalWeight = request.getItems().stream().mapToInt(item -> item.getQuantity() * 200).sum(); // Giả sử mỗi item 200g
        ghnRequest.setWeight(totalWeight);
        ghnRequest.setHeight(10); // cm
        ghnRequest.setLength(20); // cm
        ghnRequest.setWidth(15);  // cm

        // Tiền thu hộ (COD)
        // Nếu là thanh toán khi nhận hàng (cash) thì tổng tiền là COD, ngược lại là 0
        final long CASH_PAYMENT_METHOD_ID = 2L; // Giả sử ID của "Cash On Delivery" là 2
        if (request.getPaymentMethodId() == CASH_PAYMENT_METHOD_ID) {
            ghnRequest.setCodAmount(order.getTotalAmount().intValue());
        } else {
            ghnRequest.setCodAmount(0);
        }

        // Nội dung đơn hàng, người trả phí ship...
        ghnRequest.setContent("Test Order " + order.getCode());
        ghnRequest.setPaymentTypeId(2); // 2: Người bán trả phí
        ghnRequest.setNote(order.getNotes());
        ghnRequest.setRequiredNote("CHOXEMHANGKHONGTHU"); // Luôn cho khách xem hàng
        ghnRequest.setServiceId(0);
        ghnRequest.setToWardCode(request.getGuestWardCode());
        ghnRequest.setToDistrictId(request.getGuestDistrictId().intValue());

        try {
            logger.info("Đang gửi yêu cầu đến GHN: {}", this.objectMapper.writeValueAsString(ghnRequest));
        } catch (Exception e) {
            logger.error("Không thể ghi log ghnRequest", e);
        }

        // Gọi GhnApiService bạn đã tạo
        ghnApiService.createOrder(ghnRequest).subscribe(
                ghnResponse -> {
                    // Khi thành công, cập nhật lại đơn hàng của bạn với mã vận đơn GHN
                    try {
                        // BƯỚC 2: Tạo một đối tượng Map để chứa thông tin
                        Map<String, String> shipmentInfo = Map.of(
                                "carrier", "GHN",
                                "tracking_code", ghnResponse.getOrderCode()
                        );

                        // BƯỚC 3: Chuyển đổi Map thành chuỗi JSON và lưu vào cột 'notes'
                        String shipmentInfoJson = this.objectMapper.writeValueAsString(shipmentInfo);

                        order.setNotes(shipmentInfoJson); // Lưu vào cột notes
                        orderRepository.save(order); // Lưu lại

                        logger.info("Đã đăng ký vận đơn GHN thành công cho order code: {}. Thông tin lưu trong 'notes'.",
                                order.getCode());
                    } catch (Exception e) {
                        logger.error("Lỗi khi chuyển đổi thông tin vận đơn thành JSON cho order code {}: {}", order.getCode(), e.getMessage());
                    }
                },
                error -> {
                    // Xử lý lỗi khi gọi API GHN (ví dụ: thiếu thông tin, sai địa chỉ)
                    logger.error("Lỗi khi gọi API GHN cho order code {}: {}", order.getCode(), error.getMessage());
                }
        );
    }

    @Transactional
    public void processPaidOrder(String uniqueCode, boolean flag) {
        // Find the order using the unique payment code
        Order paidOrder = orderRepository.findByCode(uniqueCode)
                .orElseThrow(() -> new RuntimeException("Paid order not found with code: " + uniqueCode));

        // Check if order is already processed to prevent duplicate emails
        if ("Paid".equalsIgnoreCase(paidOrder.getOrderStatus())) {
            // Already paid, just remove from tracking and exit
            qrCodeManager.markAsPaid(uniqueCode);
            return;
        }

        // 1. Update order status to "Paid"
        if (flag)
            paidOrder.setOrderStatus("Paid");
        else
            paidOrder.setOrderStatus("Cash");
        orderRepository.save(paidOrder);

        // 2. Construct the InvoiceData object from the order
        List<InvoiceData.Item> items = paidOrder.getOrderItems().stream()
                .map(orderItem -> new InvoiceData.Item(
                        orderItem.getProduct().getProductName(),
                        orderItem.getQuantity(),
                        orderItem.getUnitPrice().doubleValue()
                ))
                .toList();

        InvoiceData invoiceData = new InvoiceData(
                paidOrder.getCode(), // Assuming order code is the invoice number
                paidOrder.getOrderDate().toString(), // Or format it as needed
                "Công ty Dole Saigon\n123 ABC, Q1, TPHCM",
                paidOrder.getReceiverFullName() + "\n" + paidOrder.getFullShippingAddress(),
                items,
                paidOrder.getTotalAmount().doubleValue(),
                null // Logo will be added by InvoiceService
        );

        // 3. Send the invoice email
        try {
            invoiceService.createAndEmailInvoice(invoiceData, paidOrder.getReceiverEmail());
        } catch (Exception e) {
            // Log the error but don't stop the process, as the order is already paid
            logger.error("Failed to send invoice email for order code {}: {}", uniqueCode, e.getMessage());
        }

        // 4. Stop tracking this code as it's now processed
        qrCodeManager.markAsPaid(uniqueCode);
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