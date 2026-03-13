package com.example.Doanlesg.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/chat")
public class ChatProxyController {

    private static final Logger logger = LoggerFactory.getLogger(ChatProxyController.class);

    // Max requests per IP per minute
    private static final int MAX_REQUESTS_PER_MINUTE = 20;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> windowStart = new ConcurrentHashMap<>();

    @Value("${N8N_CHAT_URL}")
    private String n8nChatUrl;

    @PostMapping("/consult")
    public ResponseEntity<?> proxyToN8n(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        String clientIp = getClientIp(request);

        if (isRateLimited(clientIp)) {
            logger.warn("Rate limit exceeded for IP: {}", clientIp);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Bạn đang gửi quá nhiều tin nhắn. Vui lòng chờ một chút."));
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Object> n8nResponse = restTemplate.exchange(
                    n8nChatUrl, HttpMethod.POST, entity, Object.class);

            return ResponseEntity.ok(n8nResponse.getBody());
        } catch (Exception e) {
            logger.error("Error proxying to n8n: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "Lỗi kết nối đến dịch vụ AI."));
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
