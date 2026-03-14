package com.example.Doanlesg.services;

import com.example.Doanlesg.model.InvoiceData;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.*;

@Service
public class InvoiceService {

    private static final Logger logger = LoggerFactory.getLogger(InvoiceService.class);

    private final TemplateEngine templateEngine;
    private final JavaMailSender mailSender;

    private final String styleCssContent;

    @Autowired
    public InvoiceService(
            TemplateEngine templateEngine,
            JavaMailSender mailSender
    ) throws IOException {

        this.templateEngine = templateEngine;
        this.mailSender = mailSender;

        try (InputStream is = new ClassPathResource("static/style.css").getInputStream()) {
            this.styleCssContent = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            logger.info("Loaded style.css for email inline styling");
        }
    }

    /*
     * MAIN ENTRY: send invoice email
     */
    public void sendInvoiceEmail(String toEmail, InvoiceData invoiceData)
            throws IOException, MessagingException {

        logger.info("Preparing invoice email {}", invoiceData.invoiceNumber());

        String htmlContent = generateInlinedInvoiceHtml(invoiceData);

        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject("Invoice #" + invoiceData.invoiceNumber());
        helper.setText(htmlContent, true);

        mailSender.send(message);

        logger.info("Invoice email {} sent to {}", invoiceData.invoiceNumber(), toEmail);
    }

    /*
     * Generate HTML
     */
    public String generateInlinedInvoiceHtml(InvoiceData invoiceData) throws IOException {

        String rawHtmlContent = parseThymeleafTemplate(invoiceData);

        String htmlWithEmbeddedCss =
                rawHtmlContent.replace("</head>",
                        "<style id='email-styles'>" + styleCssContent + "</style></head>");

        return processHtmlForEmail(htmlWithEmbeddedCss);
    }

    public String getLogoAsBase64() throws IOException {
        ClassPathResource logoResource = new ClassPathResource("static/logo.png");
        byte[] logoBytes = logoResource.getInputStream().readAllBytes();
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(logoBytes);
    }

    private String parseThymeleafTemplate(InvoiceData invoiceData) throws IOException {

        Context context = new Context();
        context.setVariable("invoice", invoiceData);
        context.setVariable("logoBase64", getLogoAsBase64());

        return templateEngine.process("invoice-template.html", context);
    }

    /*
     * Inline CSS
     */
    public String processHtmlForEmail(String html) {

        Document doc = Jsoup.parse(html);

        doc.select("link[rel='stylesheet']").remove();

        Elements styleElements = doc.select("style");

        Map<String, Map<String, String>> rulesBySelector = new HashMap<>();

        for (Element styleElement : styleElements) {

            String css = styleElement.html();

            Pattern pattern =
                    Pattern.compile("([a-zA-Z0-9_\\-\\.]+)\\s*\\{([^}]+)\\}");

            Matcher matcher = pattern.matcher(css);

            while (matcher.find()) {

                String selector = matcher.group(1).trim();
                String propertiesString = matcher.group(2);

                Map<String, String> properties = new HashMap<>();

                for (String prop : propertiesString.split(";")) {

                    String[] parts = prop.split(":", 2);

                    if (parts.length == 2) {
                        properties.put(parts[0].trim(), parts[1].trim());
                    }
                }

                rulesBySelector.put(selector, properties);
            }
        }

        for (Map.Entry<String, Map<String, String>> entry : rulesBySelector.entrySet()) {

            Elements elements = doc.select(entry.getKey());

            for (Element element : elements) {

                String currentStyle = element.attr("style");

                StringBuilder newStyle = new StringBuilder(currentStyle);

                if (!currentStyle.endsWith(";") && !currentStyle.isEmpty()) {
                    newStyle.append(";");
                }

                for (Map.Entry<String, String> prop : entry.getValue().entrySet()) {

                    newStyle.append(prop.getKey())
                            .append(":")
                            .append(prop.getValue())
                            .append(";");
                }

                element.attr("style", newStyle.toString());
            }
        }

        doc.select("style").remove();

        return doc.html();
    }
}