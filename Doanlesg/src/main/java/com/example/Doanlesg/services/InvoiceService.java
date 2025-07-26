package com.example.Doanlesg.services;

import com.example.Doanlesg.model.InvoiceData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


@Service
public class InvoiceService {

    private static final Logger logger = LoggerFactory.getLogger(InvoiceService.class);
    private final TemplateEngine templateEngine;
    // Không cần JavaMailSender emailSender nữa
    private final String styleCssContent;

    @Autowired
    public InvoiceService(TemplateEngine templateEngine) throws IOException { // Bỏ JavaMailSender
        this.templateEngine = templateEngine;
        // Không cần this.emailSender = emailSender nữa

        try (InputStream is = new ClassPathResource("static/style.css").getInputStream()) {
            this.styleCssContent = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            logger.info("Đã đọc nội dung style.css từ classpath để inline.");
        } catch (IOException e) {
            logger.error("Không thể đọc style.css từ classpath. Email HTML có thể không có style.", e);
            throw e;
        }
    }

    /**
     * Phương thức chính này giờ đây CHỈ tạo ra chuỗi HTML đã inline CSS.
     * Nó được đặt public để các service khác (ví dụ: OrderService hoặc một lớp quản lý email) có thể gọi.
     * @param invoiceData Dữ liệu hóa đơn để render template.
     * @return Chuỗi HTML đã được inline CSS, sẵn sàng để gửi qua email.
     */
    public String generateInlinedInvoiceHtml(InvoiceData invoiceData) throws IOException { // Đổi tên method và kiểu trả về
        logger.info("Bắt đầu chuẩn bị nội dung HTML cho email hóa đơn: {}", invoiceData.invoiceNumber());

        // 1. Render template Thymeleaf thành HTML thô
        String rawHtmlContent = parseThymeleafTemplate(invoiceData);

        // 2. Thêm CSS vào thẻ <style> bên trong HTML đã render
        String htmlWithEmbeddedCss = rawHtmlContent.replace("</head>", "<style id='email-styles'>" + styleCssContent + "</style></head>");

        // 3. Tự inline CSS bằng logic của chúng ta
        String finalHtmlEmailContent = processHtmlForEmail(htmlWithEmbeddedCss); // Giữ lại method này

        logger.info("Hoàn tất tạo nội dung HTML email cho hóa đơn {}.", invoiceData.invoiceNumber());
        return finalHtmlEmailContent;
    }

    public String getLogoAsBase64() throws IOException {
        ClassPathResource logoResource = new ClassPathResource("static/logo.png");
        byte[] logoBytes = logoResource.getInputStream().readAllBytes();
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(logoBytes);
    }

    private String parseThymeleafTemplate(InvoiceData invoiceData) throws IOException {
        Context thymeleafContext = new Context();
        thymeleafContext.setVariable("invoice", invoiceData);
        thymeleafContext.setVariable("logoBase64", getLogoAsBase64());
        return templateEngine.process("invoice-template.html", thymeleafContext);
    }

    // Phương thức này giờ sẽ làm nhiệm vụ inline CSS
    public String processHtmlForEmail(String html) { // Đặt là public để có thể gọi nội bộ hoặc từ test
        Document doc = Jsoup.parse(html);

        doc.select("link[rel='stylesheet']").remove();

        Elements styleElements = doc.select("style");
        Map<String, Map<String, String>> rulesBySelector = new HashMap<>();

        for (Element styleElement : styleElements) {
            String css = styleElement.html();
            // Cải thiện regex để bắt các selector element và class đơn giản
            Pattern pattern = Pattern.compile("([a-zA-Z0-9_\\-\\.]+|[a-zA-Z0-9_\\-]+)\\s*\\{([^}]+)\\}");
            Matcher matcher = pattern.matcher(css);

            while (matcher.find()) {
                String selector = matcher.group(1).trim();
                String propertiesString = matcher.group(2);

                Map<String, String> properties = new HashMap<>();
                for (String propDeclaration : propertiesString.split(";")) {
                    String[] parts = propDeclaration.split(":", 2);
                    if (parts.length == 2) {
                        properties.put(parts[0].trim(), parts[1].trim());
                    }
                }
                rulesBySelector.put(selector, properties);
            }
        }

        for (Map.Entry<String, Map<String, String>> entry : rulesBySelector.entrySet()) {
            String selector = entry.getKey();
            Map<String, String> propertiesToApply = entry.getValue();

            Elements elementsToStyle = doc.select(selector);
            for (Element element : elementsToStyle) {
                String currentStyle = element.attr("style");
                StringBuilder newStyleBuilder = new StringBuilder();
                if (!currentStyle.isEmpty()) {
                    newStyleBuilder.append(currentStyle.trim());
                    if (!newStyleBuilder.toString().endsWith(";")) {
                        newStyleBuilder.append(";");
                    }
                    newStyleBuilder.append(" ");
                }
                for (Map.Entry<String, String> propEntry : propertiesToApply.entrySet()) {
                    newStyleBuilder.append(propEntry.getKey()).append(":").append(propEntry.getValue()).append(";");
                }
                element.attr("style", newStyleBuilder.toString());
            }
        }

        doc.select("style").remove();

        return doc.html();
    }
}