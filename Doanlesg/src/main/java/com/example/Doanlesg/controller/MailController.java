package com.example.Doanlesg.controller;

import com.example.Doanlesg.model.InvoiceData;
import com.example.Doanlesg.services.InvoiceService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Controller
public class MailController {

    private InvoiceService invoiceService;

    @Autowired
    public MailController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }
    private String getLogoAsBase64() throws IOException {
        // ClassPathResource sẽ tìm file trong thư mục 'src/main/resources'
        ClassPathResource logoResource = new ClassPathResource("static/logo.png");

        // Đọc toàn bộ file ảnh thành một mảng byte
        byte[] logoBytes = logoResource.getInputStream().readAllBytes();

        // Mã hóa mảng byte thành chuỗi Base64 và thêm tiền tố để tạo Data URL
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(logoBytes);
    }

    @PostMapping("/send-invoice")
    public String sendInvoice(  RedirectAttributes redirectAttributes) {
        try {
            List<InvoiceData.Item> items = List.of(
                    new InvoiceData.Item("Sản phẩm A", 2, 500000),
                    new InvoiceData.Item("Dịch vụ B", 1, 1500000)
            );
            double total = items.stream().mapToDouble(it -> it.quantity() * it.unitCost()).sum();

            InvoiceData data = new InvoiceData(
                    "2025-SP-001",
                    "10/06/2025",
                    "Công ty Của Bạn\n123 ABC, Q1, TPHCM",
                    "Khách Hàng Lớn\n456 DEF, Q7, TPHCM",
                    items,
                    total, // Không còn taxRate
                    getLogoAsBase64()
            );

            invoiceService.createAndEmailInvoice(data, "azinz850@gmail.com");

            redirectAttributes.addFlashAttribute("successMessage", "Hóa đơn đã được gửi thành công!");

        } catch (IOException | MessagingException e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("errorMessage", "Gửi hóa đơn thất bại: " + e.getMessage());
        }
        ///  O day thi de cai trang landing page sau khi thanh toan thanh cong. (Luong goi tu thanh toan -> mail -> thanh toan thanh cong)
        return "redirect:/";
    }
}
