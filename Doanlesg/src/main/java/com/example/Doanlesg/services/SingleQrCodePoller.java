package com.example.Doanlesg.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Component
public class SingleQrCodePoller {

    private static final Logger logger = LoggerFactory.getLogger(SingleQrCodePoller.class);
    private final N8nPaymentService n8nPaymentService;
    private final QRCodeManagermentService qrCodeManager;
    private final OrderService orderService;

    @Value("${CASSO_POLLING_DELAY_MS}")
    private long pollIntervalMillis;

    public SingleQrCodePoller(N8nPaymentService n8nPaymentService, QRCodeManagermentService qrCodeManager, OrderService orderService) {
        this.n8nPaymentService = n8nPaymentService;
        this.qrCodeManager = qrCodeManager;
        this.orderService = orderService;
    }

    @Async
    public void pollForPayment(String uniqueCode, OffsetDateTime startTimeUtc) {
        logger.info("[POLLER for {}] Starting polling task. Will check for 5 minutes.", uniqueCode);

        // Calculate expiry based on the received UTC start time
        // The expiry time will also be in UTC
        OffsetDateTime expiryTimeUtc = startTimeUtc.plusMinutes(5);

        while (OffsetDateTime.now(ZoneOffset.UTC).isBefore(expiryTimeUtc)) {
            boolean paymentFound = false;

            try {
                if (!qrCodeManager.isCodeActive(uniqueCode)) {
                    logger.info("[POLLER for {}] Code is no longer active. Stopping task.", uniqueCode);
                    return;
                }

                logger.info("[POLLER for {}] Checking for payment via n8n...", uniqueCode);

                Boolean isPaid = n8nPaymentService.checkPayment(uniqueCode).block();

                if (Boolean.TRUE.equals(isPaid)) {
                    logger.info("[POLLER for {}] PAYMENT FOUND via n8n!", uniqueCode);
                    orderService.processPaidOrder(uniqueCode, true);
                    paymentFound = true;
                }

            } catch (Exception e) {
                logger.error("[POLLER for {}] An exception occurred during polling: {}", uniqueCode, e.getMessage());
            }

            if (paymentFound) {
                return;
            }

            try {
                Thread.sleep(pollIntervalMillis);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                logger.error("[POLLER for {}] Polling task was interrupted.", uniqueCode, e);
                // Propagate the interrupt if needed, or re-throw as a custom runtime exception
            }
        }

        // If the loop finishes without finding payment, log that it timed out
        logger.info("[POLLER for {}] Polling task completed without finding payment (timed out).", uniqueCode);
        qrCodeManager.markAsExpired(uniqueCode);
    }
}