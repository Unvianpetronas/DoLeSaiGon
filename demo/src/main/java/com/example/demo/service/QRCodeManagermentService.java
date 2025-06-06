package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class QRCodeManagermentService {

    private static final Logger logger = LoggerFactory.getLogger(QRCodeManagermentService.class);
    private final Map<String, LocalDateTime> activeCodes = new ConcurrentHashMap<>();
    private final VietQRService vietQRService;
    private final SingleQrCodePoller poller;

    @Lazy
    public QRCodeManagermentService(VietQRService vietQRService, SingleQrCodePoller poller) {
        this.vietQRService = vietQRService;
        this.poller = poller;
    }

    public PaymentInfo generateAndTrackCode(long amount) {
        String uniqueCode = "ORDER" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        LocalDateTime startTime = LocalDateTime.now();
        LocalDateTime expiryTime = startTime.plusMinutes(5);

        activeCodes.put(uniqueCode, expiryTime);
        logger.info("Generated new QR Code: {}. It will expire at {}.", uniqueCode, expiryTime);

        poller.pollForPayment(uniqueCode, startTime);

        String qrUrl = vietQRService.generateQrCodeUrl(amount, uniqueCode);
        return new PaymentInfo(uniqueCode, qrUrl, expiryTime);
    }

    public boolean isCodeActive(String code) {
        return activeCodes.containsKey(code);
    }

    public void markAsPaid(String code) {
        if (activeCodes.remove(code) != null) {
            logger.info("Code {} has been marked as PAID and removed from tracking.", code);
        }
    }

    public void markAsExpired(String code) {
        if (activeCodes.remove(code) != null) {
            logger.warn("Code {} has been marked as EXPIRED and removed from tracking.", code);
            // TODO: Thêm logic xử lý đơn hàng hết hạn ở đây
        }
    }

    public record PaymentInfo(String uniqueCode, String qrUrl, LocalDateTime expiryTime) {}
}