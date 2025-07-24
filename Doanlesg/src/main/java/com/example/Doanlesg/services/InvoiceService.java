package com.example.Doanlesg.services;

import com.example.Doanlesg.model.InvoiceData;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.*;
import java.util.Base64;

@Service
public class InvoiceService {

    private final TemplateEngine templateEngine;

    private final JavaMailSender mailSender;

    @Autowired
    public InvoiceService(TemplateEngine templateEngine, JavaMailSender mailSender) {
        this.templateEngine = templateEngine;
        this.mailSender = mailSender;
    }

    public void createAndEmailInvoice(InvoiceData invoiceData, String recipientEmail) throws IOException, MessagingException {
        String htmlContent = parseThymeleafTemplate(invoiceData);
        byte[] pdfBytes = generatePdfFromHtml(htmlContent);
        sendEmailWithAttachment(recipientEmail, invoiceData.invoiceNumber(), pdfBytes);
    }

    private String parseThymeleafTemplate(InvoiceData invoiceData) {
        Context thymeleafContext = new Context();
        thymeleafContext.setVariable("invoice", invoiceData);
        return templateEngine.process("invoice-template.html", thymeleafContext);
    }

    public String getLogoAsBase64() throws IOException {
        // ClassPathResource sẽ tìm file trong thư mục 'src/main/resources'
        ClassPathResource logoResource = new ClassPathResource("static/logo.png");

        // Đọc toàn bộ file ảnh thành một mảng byte
        byte[] logoBytes = logoResource.getInputStream().readAllBytes();

        // Mã hóa mảng byte thành chuỗi Base64 và thêm tiền tố để tạo Data URL
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(logoBytes);
    }

    private byte[] generatePdfFromHtml(String html) throws IOException {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();

            // 1. Tải font từ classpath vào một mảng byte
            // Cách này xử lý IOException một cách an toàn và chỉ đọc file một lần.
            byte[] fontBytes;
            try (InputStream fontStream = new ClassPathResource("fonts/NotoSans-Vietnamese.ttf").getInputStream()) {
                fontBytes = fontStream.readAllBytes();
            }

            // 2. Cung cấp font cho builder thông qua một InputStream được tạo từ mảng byte.
            // Kỹ thuật này sử dụng một "supplier" (biểu thức lambda `() -> ...`)
            // để builder có thể lấy stream font khi cần.
            builder.useFont(() -> new ByteArrayInputStream(fontBytes), "Noto Sans");

            // Dòng này rất có thể sẽ gây ra lỗi tương tự khi chạy trong file JAR
            String baseUri = new ClassPathResource("/static/").getURL().toString();
            builder.withHtmlContent(html, baseUri);

            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        }
    }

    private void sendEmailWithAttachment(String to, String invoiceNumber, byte[] pdfAttachment) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("no-reply@dolesaigon.io.vn");
        helper.setTo(to);
        helper.setSubject("Hóa đơn #" + invoiceNumber + " từ Đồ lễ Sài Gòn");
        helper.setText("Kính gửi quý khách,\n\nVui lòng xem hóa đơn điện tử đính kèm.\n\nTrân trọng,\nĐồ lễ Sài Gòn.");

        String filename = "HoaDon_" + invoiceNumber + ".pdf";
        helper.addAttachment(filename, () -> new ByteArrayInputStream(pdfAttachment));

        mailSender.send(message);
        System.out.println("Email đã được gửi thành công đến " + to);
    }
}
