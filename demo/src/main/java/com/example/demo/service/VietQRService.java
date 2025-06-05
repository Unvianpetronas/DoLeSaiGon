package com.example.demo.service;

import org.springframework.stereotype.Service;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class VietQRService {

    // Thay thế bằng thông tin tài khoản của bạn
    private static final String VIETQR_TEMPLATE = "https://api.vietqr.io/image/970415-100877543376-WEMdHcP.jpg?accountName=DOLESAIGON&amount=%d&addInfo=%s";

    public String generateQrCodeUrl(long amount, String description) {
        try {
            String encodedDesc = URLEncoder.encode(description, StandardCharsets.UTF_8.name());
            return String.format(VIETQR_TEMPLATE, amount, encodedDesc);
        } catch (Exception e) {
            throw new RuntimeException("Could not generate QR Code URL", e);
        }
    }
}