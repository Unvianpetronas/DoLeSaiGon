package com.example.Doanlesg.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class N8nPaymentService {

    private static final Logger logger = LoggerFactory.getLogger(N8nPaymentService.class);

    private final WebClient webClient;
    private final String checkUrl;

    public N8nPaymentService(@Value("${N8N_CHECK_URL}") String checkUrl) {
        this.checkUrl = checkUrl;
        this.webClient = WebClient.builder().build();
    }

    public Mono<Boolean> checkPayment(String uniqueCode) {
        return webClient.post()
                .uri(checkUrl)
                .bodyValue(Map.of("code", uniqueCode))
                .retrieve()
                .bodyToMono(String.class)  // parse raw string trước
                .map(raw -> {
                    logger.info("[N8N RAW] Response: {}", raw);
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        if (raw.trim().startsWith("[")) {
                            // Array: [{...}]
                            List<Map<String, Object>> list = mapper.readValue(raw, List.class);
                            if (list == null || list.isEmpty()) return false;
                            return Boolean.TRUE.equals(list.getFirst().get("Paid"));
                        } else {
                            // Object: {...}
                            Map<String, Object> obj = mapper.readValue(raw, Map.class);
                            return Boolean.TRUE.equals(obj.get("Paid"));
                        }
                    } catch (Exception e) {
                        logger.error("[N8N PARSE] Failed to parse: {}", raw);
                        return false;
                    }
                })
                .onErrorResume(e -> {
                    logger.error("[N8N CHECK] Error for code {}: {}", uniqueCode, e.getMessage());
                    return Mono.just(false);
                });
    }
}
