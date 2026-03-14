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
    public void sendOrderConfirmationEmail(Order order, String invoiceHtml) {

        logger.info("Preparing to send invoice email for order {} via Mailgun...", order.getCode());

        try {

            MailgunMessagesApi mailgunMessagesApi =
                    MailgunClient.config(mailgunApiKey)
                            .createApi(MailgunMessagesApi.class);

            String subject = "Xác nhận đơn hàng #" + order.getCode();

            // Optional header message before the invoice
            String htmlBody =
                    "<h3>Cảm ơn bạn đã đặt hàng tại Đồ lễ Sài Gòn!</h3>"
                            + "<p>Đơn hàng của bạn <b>#" + order.getCode() + "</b> đã được thanh toán thành công.</p>"
                            + "<p>Chi tiết hóa đơn của bạn:</p>"
                            + "<hr/>"
                            + invoiceHtml;

            Message message = Message.builder()
                    .from(senderEmail)
                    .to(order.getReceiverEmail())
                    .subject(subject)
                    .html(htmlBody)
                    .build();

            MessageResponse response =
                    mailgunMessagesApi.sendMessage(mailgunDomain, message);

            logger.info("✅ Mailgun email sent for order {}: {}",
                    order.getCode(),
                    response.getMessage());

        } catch (Exception e) {

            logger.error("❌ Failed to send Mailgun email for order {}: {}",
                    order.getCode(),
                    e.getMessage());
        }
    }
}