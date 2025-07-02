package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.CartItemDTO;
import com.example.Doanlesg.dto.CheckoutRequestDTO;
import com.example.Doanlesg.dto.OrderTotalDTO;
import com.example.Doanlesg.model.*;
import com.example.Doanlesg.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    public OrderService(OrderRepository orderRepository, AccountRepository accountRepository, ProductRepository productRepository, OderItemRepository orderItemRepository, PaymentRepository paymentRepository, ShippingRepository shippingRepository, InvoiceService invoiceService, QRCodeManagermentService qrCodeManagermentService) {
        this.orderRepository = orderRepository;
        this.accountRepository = accountRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.shippingRepository = shippingRepository;
        this.invoiceService = invoiceService;
        this.qrCodeManager = qrCodeManagermentService;
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

        // 4. Lưu đơn hàng và các mặt hàng liên quan
        orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);
    }

    @Transactional
    public void processPaidOrder(String uniqueCode) {
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
        paidOrder.setOrderStatus("Paid");
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
}