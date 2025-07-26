package com.example.Doanlesg.services;

import com.example.Doanlesg.model.Order;
import com.postmarkapp.postmark.Postmark;
import com.postmarkapp.postmark.client.ApiClient;
import com.postmarkapp.postmark.client.data.model.message.Message;
import com.postmarkapp.postmark.client.data.model.message.MessageResponse;
import com.postmarkapp.postmark.client.exception.PostmarkException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async; // Giữ lại @Async
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class PostmarkEmailService {

    private static final Logger logger = LoggerFactory.getLogger(PostmarkEmailService.class);

    @Value("${POSTMARK_API_TOKEN}")
    private String postmarkApiToken;

    @Value("${SENDER_EMAIL}")
    private String senderEmail;

    // Không cần inject InvoiceService vào đây nếu InvoiceService chỉ tạo HTML và PostmarkEmailService chỉ gửi.
    // Nếu bạn muốn PostmarkEmailService tự gọi InvoiceService để tạo HTML, thì mới inject.
    // Nhưng cách phân chia trách nhiệm tốt hơn là InvoiceService tạo HTML, và service gọi PostmarkEmailService sẽ truyền HTML đó vào.

    /**
     * Gửi email xác nhận đơn hàng với nội dung HTML trực tiếp.
     * @param order Đối tượng đơn hàng chứa thông tin cần thiết (email người nhận, mã đơn hàng).
     * @param htmlContent Chuỗi HTML ĐÃ ĐƯỢC XỬ LÝ (đã inline CSS) để gửi.
     */
    @Async // Giữ lại @Async để gửi email không chặn luồng chính
    public void sendOrderConfirmationEmail(Order order, String htmlContent) { // Thay đổi tham số
        logger.info("Chuẩn bị gửi email xác nhận cho đơn hàng {} qua Postmark...", order.getCode());
        try {
            ApiClient client = Postmark.getApiClient(postmarkApiToken);
            String subject = "Xác nhận đơn hàng #" + order.getCode();

            // Sử dụng nội dung HTML đã được truyền vào
            Message message = new Message(senderEmail, order.getReceiverEmail(), subject, htmlContent);

            // Không có phần đính kèm PDF nữa

            MessageResponse response = client.deliverMessage(message);
            logger.info("✅ Gửi email cho đơn hàng {} qua Postmark thành công! Message ID: {}",
                    order.getCode(), response.getMessageId());
        } catch (PostmarkException | IOException e) { // Bắt các lỗi từ Postmark API
            logger.error("❌ Lỗi khi gửi email qua Postmark cho đơn hàng {}: {}", order.getCode(), e.getMessage(), e);
        } catch (Exception e) { // Bắt các lỗi không xác định khác
            logger.error("❌ Lỗi không xác định khi gửi email qua Postmark cho đơn hàng {}: {}", order.getCode(), e.getMessage(), e);
        }
    }
}