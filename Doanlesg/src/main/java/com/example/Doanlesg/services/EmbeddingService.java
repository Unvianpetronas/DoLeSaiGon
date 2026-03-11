package com.example.Doanlesg.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {

    private final RestTemplate restTemplate = new RestTemplate();

    public double[] generateEmbedding(String text) {

        String url = "http://localhost:11434/api/embeddings";

        Map<String, Object> request = new HashMap<>();
        request.put("model", "nomic-embed-text");
        request.put("prompt", text);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(url, request, Map.class);

        List<Double> embeddingList =
                (List<Double>) response.getBody().get("embedding");

        return embeddingList.stream()
                .mapToDouble(Double::doubleValue)
                .toArray();
    }
}
