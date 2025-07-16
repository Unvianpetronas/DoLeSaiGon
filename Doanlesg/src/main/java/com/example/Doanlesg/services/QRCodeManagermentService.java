package com.example.Doanlesg.services;

import com.example.Doanlesg.model.Order;
import com.example.Doanlesg.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class QRCodeManagermentService {

    private static final Logger logger = LoggerFactory.getLogger(QRCodeManagermentService.class);
    private final Map<String, LocalDateTime> activeCodes = new ConcurrentHashMap<>();
    private final VietQRService vietQRService;
    private final SingleQrCodePoller poller;

    private final OrderRepository orderRepository;

    @Lazy
    public QRCodeManagermentService(VietQRService vietQRService, SingleQrCodePoller poller, OrderRepository orderRepository) {
        this.vietQRService = vietQRService;
        this.poller = poller;
        this.orderRepository = orderRepository;
    }

    public String generateCode() {
        return "ORDER" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }


    public PaymentInfo getPaymentInfo() {
        return new PaymentInfo(generateCode(), "", OffsetDateTime.now());
    }

    public PaymentInfo trackCode(BigDecimal amount) {
        String uniqueCode = generateCode();

        // 1. Get current time in UTC
        Instant now = Instant.now();

        // 2. Calculate expiry in UTC
        Instant expiryInstant = now.plus(5, ChronoUnit.MINUTES);

        // 3. Create OffsetDateTime objects in UTC for external communication/storage
        OffsetDateTime expiryOffsetDateTimeUtc = expiryInstant.atOffset(ZoneOffset.UTC);
        OffsetDateTime startOffsetDateTimeUtc = now.atOffset(ZoneOffset.UTC);

        activeCodes.put(uniqueCode, LocalDateTime.ofInstant(expiryInstant, ZoneOffset.UTC));

        logger.info("Generated new QR Code: {}. It will expire at {} (UTC).", uniqueCode, expiryOffsetDateTimeUtc);

        poller.pollForPayment(uniqueCode, startOffsetDateTimeUtc);

        String qrUrl = vietQRService.generateQrCodeUrl(amount, uniqueCode);

        return new PaymentInfo(uniqueCode, qrUrl, expiryOffsetDateTimeUtc);
    }

    public boolean isCodeActive(String code) {
        return activeCodes.containsKey(code);
    }

    @Transactional
    public void markAsPaid(String code) {
        if (activeCodes.remove(code) != null) {
            logger.info("Code {} has been marked as PAID and removed from tracking.", code);
            orderRepository.findByCode(code).ifPresent(order -> order.setOrderStatus("Paid"));
        }
    }

    @Transactional // This annotation is still crucial
    public void markAsExpired(String code) {
        // 1. Find the Order by its unique code.
        // You will need to add this 'findByCode' method to your OrderRepository interface.
        Order orderToExpire = orderRepository.findByCode(code)
                .orElse(null); // Use orElse(null) to handle cases where the order might already be deleted.

        // 2. If the order exists, delete it.
        if (orderToExpire != null) {
            orderRepository.delete(orderToExpire);
        }
    }

    public record PaymentInfo(String uniqueCode, String qrUrl, OffsetDateTime expiryTime) {}
}