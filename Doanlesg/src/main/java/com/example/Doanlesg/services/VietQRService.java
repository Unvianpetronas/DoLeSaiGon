package com.example.Doanlesg.services;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class VietQRService {

    // Thay thế bằng thông tin tài khoản của bạn
    private static final String VIETQR_TEMPLATE = "https://api.vietqr.io/image/970448-0908517568-WEMdHcP.jpg?accountName=DOLESAIGON&amount=%s&addInfo=%s";

    public String generateQrCodeUrl(BigDecimal amount, String description) {
        try {
            String encodedDesc = URLEncoder.encode(description, StandardCharsets.UTF_8);
            return String.format(VIETQR_TEMPLATE, amount.toPlainString(), encodedDesc);
        } catch (Exception e) {
            throw new RuntimeException("Could not generate QR Code URL", e);
        }
    }
}