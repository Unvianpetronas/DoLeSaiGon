package com.example.Doanlesg.controller;


import com.example.Doanlesg.dto.CassoWebhookPayload;
import com.example.Doanlesg.model.TransactionData;
import com.example.Doanlesg.services.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/casso-webhook")
public class CassoWebhookController  {
    private static final Logger logger = LoggerFactory.getLogger(CassoWebhookController.class);

    private final OrderService orderService;

    @Value("${CASSO_WEBHOOK_TOKEN}")
    private String cassoSecureToken;

    public CassoWebhookController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<String> handleCassoWebhook(
            @RequestBody CassoWebhookPayload payload,
            @RequestHeader(value = "secure-token", required = false) String secureToken) throws IOException {

        // 1. Bảo mật: Xác thực token
        if (!cassoSecureToken.equals(secureToken)) {
            logger.warn("Received a request with an invalid secure token.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid secure token");
        }

        // 2. Xử lý dữ liệu với cấu trúc DTO mới
        if (payload.getError() == 0 && payload.getData() != null) {
            // Lấy đối tượng transaction duy nhất
            TransactionData transaction = payload.getData();

            logger.info("Webhook received for transaction description: {}", transaction.getDescription());

            // Trích xuất mã đơn hàng từ nội dung
            String uniqueCode = parseUniqueCodeFromDescription(transaction.getDescription());

            if (uniqueCode != null) {
                logger.info("✅ [WEBHOOK for {}] Payment found. Processing with amount: {}", uniqueCode, transaction.getAmount());

                // THAY ĐỔI QUAN TRỌNG: Gọi service với cả mã và số tiền để xác thực
                orderService.processPaidOrder(uniqueCode,  true);
            } else {
                logger.warn("Could not parse a unique code from description: {}", transaction.getDescription());
            }
        }

        // 3. Phản hồi cho Casso
        return ResponseEntity.ok("Webhook received");
    }
    
    // Đừng quên phương thức parseUniqueCodeFromDescription, chúng ta sẽ dùng lại nó sau
    private String parseUniqueCodeFromDescription(String description) {
        if (description == null || description.trim().isEmpty()) return null;
        String[] parts = description.split(" ");
        return parts[parts.length - 1];
    }
}
