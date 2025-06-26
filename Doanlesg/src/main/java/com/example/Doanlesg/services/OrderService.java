package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.CartItemDTO;
import com.example.Doanlesg.dto.CheckoutRequestDTO;
import com.example.Doanlesg.model.*;
import com.example.Doanlesg.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private AccountRepository accountRepository; // Giả sử bạn có
    @Autowired private ProductRepository productRepository;
    @Autowired private OderItemRepository  orderItemRepository; // Giả sử bạn có


    @Transactional
    public Order placeOrder(CheckoutRequestDTO request) {
        Order order = new Order();
        // 1. Xác định người đặt hàng (Customer hay Guest)
        if (request.getCustomerId() != null) {
            // Là khách hàng đã đăng nhập
            Optional<Account> customer = accountRepository.findById(request.getCustomerId());
                    Account account = customer.get();
            order.setAccount(account);
            order.setReceiverFullName(account.getCustomer().getFullName());
            order.setReceiverEmail(account.getEmail());
            order.setReceiverPhoneNumber(account.getEmail());
            order.setFullShippingAddress(request.getGuestAddress()); // Giả sử có địa chỉ mặc định
        } else {
            // Là khách vãng lai
            order.setReceiverFullName(request.getGuestName());
            order.setReceiverEmail(request.getGuestEmail());
            order.setReceiverPhoneNumber(request.getGuestPhone());
            order.setFullShippingAddress(request.getGuestAddress());
        }

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

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setUnitPrice(product.getPrice()); // Lấy giá từ DB để đảm bảo chính xác
            orderItem.setOrder(order);

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(product.getPrice().multiply(new BigDecimal(itemDTO.getQuantity())));
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount.add(request.getShippingFee())); // Tạm tính, chưa có phí voucher

        // TODO: Thêm logic tính áp dụng voucher ở đây để ra tổng cuối cùng

        // 4. Lưu đơn hàng và các mặt hàng liên quan
        Order savedOrder = orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);

        return savedOrder;
    }

}
