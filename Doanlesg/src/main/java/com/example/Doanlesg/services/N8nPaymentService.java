package com.example.Doanlesg.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

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
                .bodyToMono(Map.class)
                .map(response -> Boolean.TRUE.equals(response.get("paid")))
                .onErrorResume(e -> {
                    logger.error("[N8N CHECK] Error checking payment for code {}: {}", uniqueCode, e.getMessage());
                    return Mono.just(false);
                });
    }
}
