package com.example.Doanlesg.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatProxyController {

    private static final Logger logger = LoggerFactory.getLogger(ChatProxyController.class);
    private static final int MAX_REQUESTS_PER_MINUTE = 20;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> windowStart = new ConcurrentHashMap<>();

    @Value("${LMSTUDIO_URL:http://localhost:1234/v1/chat/completions}")
    private String lmStudioUrl;

    @Value("${LMSTUDIO_MODEL:local-model}")
    private String lmStudioModel;

    @PostMapping("/consult")
    public ResponseEntity<?> consult(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        String clientIp = getClientIp(request);
        if (isRateLimited(clientIp)) {
            logger.warn("Rate limit exceeded for IP: {}", clientIp);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Bạn đang gửi quá nhiều tin nhắn. Vui lòng chờ một chút."));
        }

        String customerId = String.valueOf(body.getOrDefault("customer_id", ""));
        String sessionId = String.valueOf(body.getOrDefault("session_id", "session_" + System.currentTimeMillis()));
        String message = String.valueOf(body.getOrDefault("message", ""));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> products = (List<Map<String, Object>>) body.getOrDefault("products", List.of());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> cart = (List<Map<String, Object>>) body.getOrDefault("cart", List.of());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> purchaseHistory = (List<Map<String, Object>>) body.getOrDefault("purchase_history", List.of());

        if (customerId.isBlank() || message.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Missing required fields: customer_id, message"));
        }

        try {
            String[] msgWords = message.toLowerCase().split("\\s+");

            // Filter in-stock products, score by keyword relevance, take top 15
            List<Map<String, Object>> relevant = products.stream()
                    .filter(p -> {
                        Object stock = p.get("stock");
                        return stock instanceof Number && ((Number) stock).intValue() > 0;
                    })
                    .sorted(Comparator.comparingInt((Map<String, Object> p) -> scoreProduct(p, msgWords)).reversed())
                    .limit(15)
                    .collect(Collectors.toList());

            String productCatalog = relevant.stream().map(p -> {
                String sku = String.valueOf(p.getOrDefault("sku", ""));
                String name = String.valueOf(p.getOrDefault("name", ""));
                String category = String.valueOf(p.getOrDefault("category", ""));
                double price = p.get("price") instanceof Number ? ((Number) p.get("price")).doubleValue() : 0;
                String desc = String.valueOf(p.getOrDefault("description", ""));
                if (desc.length() > 80) desc = desc.substring(0, 80);
                return "[" + sku + "] " + name + " | " + category + " | "
                        + String.format("%,.0f", price) + "đ | " + desc;
            }).collect(Collectors.joining("\n"));

            String cartSummary = cart.isEmpty() ? "Trống" :
                    cart.stream().map(c -> "[" + c.get("sku") + "] " + c.get("name") + " ×" + c.get("quantity"))
                            .collect(Collectors.joining(", "));

            String historySummary = purchaseHistory.isEmpty() ? "Chưa có" :
                    purchaseHistory.stream().limit(5)
                            .map(h -> "[" + h.get("sku") + "] " + h.get("name") + " x" + h.getOrDefault("times_bought", 1))
                            .collect(Collectors.joining(", "));

            String systemPrompt = "Tư vấn viên Dole Saigon. Quy tắc: chỉ dùng sản phẩm trong catalog, tối đa 3-5 gợi ý, "
                    + "tiếng Việt ngắn gọn, kèm [SKU]. Trả JSON: {\"reply\":\"...\","
                    + "\"recommendations\":[{\"sku\":\"...\",\"name\":\"...\",\"reason\":\"...\",\"price\":0,\"category\":\"...\"}],"
                    + "\"intent\":\"product_query|price_check|recommendation|complaint|other\"}";

            String userPrompt = "KH: " + message
                    + "\nGiỏ: " + cartSummary
                    + "\nLịch sử: " + historySummary
                    + "\n\nCATALOG (" + relevant.size() + " sản phẩm liên quan):\n"
                    + productCatalog
                    + "\n\nTrả JSON.";

            // Build LM Studio request (OpenAI-compatible)
            Map<String, Object> lmRequest = new LinkedHashMap<>();
            lmRequest.put("model", lmStudioModel);
            lmRequest.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            ));
            lmRequest.put("temperature", 0.4);
            lmRequest.put("max_tokens", 2000);
            lmRequest.put("stream", false);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(lmRequest, headers);

            ResponseEntity<Map> lmResponse = restTemplate.exchange(lmStudioUrl + "/v1/chat/completions", HttpMethod.POST, entity, Map.class);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) lmResponse.getBody().get("choices");
            @SuppressWarnings("unchecked")
            Map<String, Object> msgMap = (Map<String, Object>) choices.get(0).get("message");
            String rawText = String.valueOf(msgMap.getOrDefault("content", ""));

            Map<String, Object> parsed = parseAiResponse(rawText);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> recs = ((List<Map<String, Object>>) parsed.getOrDefault("recommendations", List.of()))
                    .stream().limit(5)
                    .map(r -> {
                        Map<String, Object> rec = new LinkedHashMap<>();
                        rec.put("sku", r.getOrDefault("sku", ""));
                        rec.put("name", r.getOrDefault("name", ""));
                        rec.put("reason", r.getOrDefault("reason", ""));
                        rec.put("price", r.getOrDefault("price", 0));
                        rec.put("category", r.getOrDefault("category", ""));
                        return rec;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("session_id", sessionId);
            data.put("reply", parsed.getOrDefault("reply", ""));
            data.put("recommendations", recs);
            data.put("intent", parsed.getOrDefault("intent", "other"));

            return ResponseEntity.ok(Map.of("success", true, "data", data));

        } catch (Exception e) {
            logger.error("Error calling LM Studio: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "Lỗi kết nối đến dịch vụ AI. Hãy chắc chắn LM Studio đang chạy."));
        }
    }

    private int scoreProduct(Map<String, Object> p, String[] words) {
        String text = (String.valueOf(p.getOrDefault("name", "")) + " "
                + String.valueOf(p.getOrDefault("category", "")) + " "
                + String.valueOf(p.getOrDefault("description", ""))).toLowerCase();
        int count = 0;
        for (String w : words) {
            if (text.contains(w)) count++;
        }
        return count;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseAiResponse(String rawText) {
        try {
            return objectMapper.readValue(rawText, Map.class);
        } catch (Exception e1) {
            try {
                int start = rawText.indexOf('{');
                int end = rawText.lastIndexOf('}');
                if (start >= 0 && end > start) {
                    return objectMapper.readValue(rawText.substring(start, end + 1), Map.class);
                }
            } catch (Exception e2) {
                // fall through
            }
            return Map.of(
                    "reply", rawText.isBlank() ? "Xin lỗi, tôi không thể xử lý yêu cầu. Vui lòng thử lại." : rawText,
                    "recommendations", List.of(),
                    "intent", "other"
            );
        }
    }

    private boolean isRateLimited(String ip) {
        long now = System.currentTimeMillis();
        long windowMs = 60_000L;

        windowStart.merge(ip, now, (existing, newVal) ->
                (now - existing > windowMs) ? newVal : existing);

        if (now - windowStart.get(ip) > windowMs) {
            windowStart.put(ip, now);
            requestCounts.put(ip, new AtomicInteger(1));
            return false;
        }

        AtomicInteger count = requestCounts.computeIfAbsent(ip, k -> new AtomicInteger(0));
        return count.incrementAndGet() > MAX_REQUESTS_PER_MINUTE;
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
