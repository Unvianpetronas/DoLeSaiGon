package com.example.Doanlesg.controller;

import com.example.Doanlesg.model.InvoiceData;
import com.example.Doanlesg.services.InvoiceService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/ver0.0.1/mail")
public class MailController {

    private InvoiceService invoiceService;

    @Autowired
    public MailController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

//    @PostMapping("/send-invoice")
//    public String sendInvoice(RedirectAttributes redirectAttributes) {
//        String msg = "";
//
//        try {
//            List<InvoiceData.Item> items = List.of(
//                    new InvoiceData.Item("Sản phẩm A", 2, 500000),
//                    new InvoiceData.Item("Dịch vụ B", 1, 1500000)
//            );
//            double total = items.stream().mapToDouble(it -> it.quantity() * it.unitCost()).sum();
//
//            InvoiceData data = new InvoiceData(
//                    "2025-SP-001",
//                    "10/06/2025",
//                    "Đồ lễ sài gòn\n 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh",
//                    "Khách Hàng\n",
//                    items,
//                    total, // Không còn taxRate
//                    invoiceService.getLogoAsBase64()
//            );
//
//            invoiceService.createAndEmailInvoice(data, "azinz850@gmail.com");
//
//            msg = "sucessfulMessage";
//
//        } catch (IOException | MessagingException e) {
//            e.printStackTrace();
//            msg = "errorMessage";
//        }
//        ///  O day thi de cai trang landing page sau khi thanh toan thanh cong. (Luong goi tu thanh toan -> mail -> thanh toan thanh cong)
//        return msg;
//    }
}
