package com.example.Doanlesg.services;

import com.example.Doanlesg.model.Order;
import com.mailgun.api.v3.MailgunMessagesApi;
import com.mailgun.client.MailgunClient;
import com.mailgun.model.message.Message;
import com.mailgun.model.message.MessageResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;

@Service
public class MailgunEmailService {

    private static final Logger logger = LoggerFactory.getLogger(MailgunEmailService.class);

    @Value("${MAILGUN_API_KEY}")
    private String mailgunApiKey;

    @Value("${MAILGUN_DOMAIN}")
    private String mailgunDomain;

    @Value("${SENDER_EMAIL}")
    private String senderEmail;

    @Async
    public void sendOrderConfirmationEmail(Order order, byte[] invoicePdf) {
        logger.info("Chuẩn bị gửi email xác nhận cho đơn hàng {} qua Mailgun...", order.getCode());

        // Thư viện Mailgun yêu cầu một đối tượng File, nên chúng ta cần lưu tạm byte[] ra file.
        File attachment = null;
        try {
            // Tạo một file tạm thời với tên duy nhất
            attachment = File.createTempFile("HoaDon-" + order.getCode(), ".pdf");
            try (FileOutputStream fos = new FileOutputStream(attachment)) {
                fos.write(invoicePdf);
            }

            // Khởi tạo Mailgun client
            MailgunMessagesApi mailgunMessagesApi = MailgunClient.config(mailgunApiKey)
                    .createApi(MailgunMessagesApi.class);

            // Xây dựng nội dung email
            String subject = "Xác nhận đơn hàng #" + order.getCode();
            String htmlBody = "<h3>Cảm ơn bạn đã đặt hàng tại Đồ lễ Sài Gòn!</h3>"
                    + "<p>Đơn hàng của bạn <b>#" + order.getCode() + "</b> đã được thanh toán thành công.</p>"
                    + "<p>Chúng tôi đã đính kèm hóa đơn trong email này.</p>";

            // Tạo đối tượng Message
            Message message = Message.builder()
                    .from(senderEmail)
                    .to(order.getReceiverEmail())
                    .subject(subject)
                    .html(htmlBody)
                    .attachment(attachment) // Đính kèm file tạm
                    .build();

            // Gửi email
            MessageResponse response = mailgunMessagesApi.sendMessage(mailgunDomain, message);
            logger.info("✅ Gửi email cho đơn hàng {} qua Mailgun thành công! Message: {}",
                    order.getCode(), response.getMessage());

        } catch (Exception e) {
            logger.error("❌ Lỗi khi gửi email qua Mailgun cho đơn hàng {}: {}", order.getCode(), e.getMessage());
        } finally {
            // Rất quan trọng: Luôn luôn xóa file tạm sau khi đã gửi xong, kể cả khi có lỗi.
            if (attachment != null && attachment.exists()) {
                if (attachment.delete()) {
                    logger.info("Đã xóa file tạm thành công: {}", attachment.getName());
                } else {
                    logger.warn("Không thể xóa file tạm: {}", attachment.getName());
                }
            }
        }
    }
}