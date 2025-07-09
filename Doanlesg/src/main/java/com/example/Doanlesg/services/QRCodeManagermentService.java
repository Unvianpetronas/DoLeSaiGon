package com.example.Doanlesg.services;

import com.example.Doanlesg.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
        return new PaymentInfo(generateCode(), "", LocalDateTime.now());
    }

    public PaymentInfo trackCode(BigDecimal amount) {
        String uniqueCode = generateCode();

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

    @Transactional
    public void markAsPaid(String code) {
        if (activeCodes.remove(code) != null) {
            logger.info("Code {} has been marked as PAID and removed from tracking.", code);
        }
    }

    @Transactional
    public void markAsExpired(String code) {
        // First, remove the code from the active tracking map to stop polling.
        if (activeCodes.remove(code) != null) {
            logger.warn("Code {} has been marked as EXPIRED and removed from tracking.", code);

            orderRepository.findByCode(code).ifPresent(order -> {
                if ("Pending".equalsIgnoreCase(order.getOrderStatus())) {
                    orderRepository.delete(order);
                    logger.info("Expired order with code {} has been deleted.", code);
                } else {
                    logger.info("Order with code {} expired but was already paid or processed. No action taken.", code);
                }
            });
        }
    }

    public record PaymentInfo(String uniqueCode, String qrUrl, LocalDateTime expiryTime) {}
}