package com.example.Doanlesg.services;

import com.example.Doanlesg.model.TransactionRecordDTO;
import com.example.Doanlesg.model.TransactionResponseWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class SingleQrCodePoller {

    private static final Logger logger = LoggerFactory.getLogger(SingleQrCodePoller.class);
    private final CassoService cassoService;
    private final QRCodeManagermentService qrCodeManager;
    private final OrderService orderService;

    @Value("${casso.polling.delay-ms}")
    private long pollIntervalMillis;

    public SingleQrCodePoller(CassoService cassoService, QRCodeManagermentService qrCodeManager, OrderService orderService) {
        this.cassoService = cassoService;
        this.qrCodeManager = qrCodeManager;
        this.orderService = orderService;
    }

    @Async
    public void pollForPayment(String uniqueCode, LocalDateTime startTime) {
        logger.info("[POLLER for {}] Starting polling task. Will check for 5 minutes.", uniqueCode);
        LocalDateTime expiryTime = startTime.plusMinutes(5);

        while (LocalDateTime.now().isBefore(expiryTime)) {
            boolean paymentFound = false;

            try {
                if (!qrCodeManager.isCodeActive(uniqueCode)) {
                    logger.info("[POLLER for {}] Code is no longer active. Stopping task.", uniqueCode);
                    return;
                }

                logger.info("[POLLER for {}] Checking for payment...", uniqueCode);
                TransactionResponseWrapper response = cassoService.getTransactionFiltered(1, 100, startTime).block();

                if ((response != null) && (response.getError() == 0) && (response.getData() != null)) {
                    for (TransactionRecordDTO record : response.getData().getRecords()) {
                        if (record.getDescription() != null && record.getDescription().contains(uniqueCode)) {
                            logger.info("✅✅✅ [POLLER for {}] PAYMENT FOUND! ID: {}, Amount: {}",
                                    uniqueCode, record.getId(), record.getAmount());

                            //TODO: Thuc hien gui direct den /send-invoice.

                            qrCodeManager.markAsPaid(uniqueCode);
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
            }
        }

        logger.warn("[POLLER for {}] 5 minutes have passed. Code expired.", uniqueCode);
        qrCodeManager.markAsExpired(uniqueCode);
    }
}