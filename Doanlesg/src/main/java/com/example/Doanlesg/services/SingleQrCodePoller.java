package com.example.Doanlesg.services;

import com.example.Doanlesg.model.TransactionRecordDTO;
import com.example.Doanlesg.model.TransactionResponseWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Component
public class SingleQrCodePoller {

    private static final Logger logger = LoggerFactory.getLogger(SingleQrCodePoller.class);
    private final CassoService cassoService;
    private final QRCodeManagermentService qrCodeManager;
    private final OrderService orderService;

    @Value("${CASSO_POLLING_DELAY_MS}")
    private long pollIntervalMillis;

    public SingleQrCodePoller(CassoService cassoService, QRCodeManagermentService qrCodeManager, OrderService orderService) {
        this.cassoService = cassoService;
        this.qrCodeManager = qrCodeManager;
        this.orderService = orderService;
    }

    @Async
    public void pollForPayment(String uniqueCode, OffsetDateTime startTimeUtc) {
        logger.info("[POLLER for {}] Starting polling task. Will check for 5 minutes.", uniqueCode);

        // Calculate expiry based on the received UTC start time
        // The expiry time will also be in UTC
        OffsetDateTime expiryTimeUtc = startTimeUtc.plusMinutes(5);

        // Convert the current time to UTC for consistent comparison
        // This is crucial to avoid timezone mismatches in the loop condition
        while (OffsetDateTime.now(ZoneOffset.UTC).isBefore(expiryTimeUtc)) {
            boolean paymentFound = false;

            try {
                if (!qrCodeManager.isCodeActive(uniqueCode)) {
                    logger.info("[POLLER for {}] Code is no longer active. Stopping task.", uniqueCode);
                    return;
                }

                logger.info("[POLLER for {}] Checking for payment...", uniqueCode);

                LocalDateTime startTimeForCasso = startTimeUtc.toLocalDateTime(); // This is the LocalDateTime part of UTC OffsetDateTime

                TransactionResponseWrapper response = cassoService.getTransactionFiltered(1, 100, startTimeForCasso).block();

                if ((response != null) && (response.getError() == 0) && (response.getData() != null)) {
                    for (TransactionRecordDTO record : response.getData().getRecords()) {
                        // Ensure record.getCreatedAt() is also handled consistently (e.g., convert to UTC)
                        // If record.getDescription() contains uniqueCode, that's fine for matching
                        if (record.getDescription() != null && record.getDescription().contains(uniqueCode)) {
                            logger.info("✅✅✅ [POLLER for {}] PAYMENT FOUND! ID: {}, Amount: {}",
                                    uniqueCode, record.getId(), record.getAmount());

                            orderService.processPaidOrder(uniqueCode);
                            paymentFound = true;
                            break;
                        }
                    }
                } else if (response != null) {
                    logger.warn("[POLLER for {}] API returned a business error: {}", uniqueCode, response.getMessage());
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