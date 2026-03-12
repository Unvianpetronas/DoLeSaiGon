package com.example.Doanlesg.services;

import com.example.Doanlesg.model.Product;
import com.example.Doanlesg.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final ProductRepository productRepository;

    public RecommendationService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> recommendProducts(Long productId) {

        Product target = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        double[] targetVector = parseEmbedding(target.getEmbedding());

        List<Product> allProducts = productRepository.findAll();

        return allProducts.stream()
                .filter(p -> !p.getId().equals(productId))
                .sorted((p1, p2) -> {

                    double sim1 = cosineSimilarity(targetVector, parseEmbedding(p1.getEmbedding()));
                    double sim2 = cosineSimilarity(targetVector, parseEmbedding(p2.getEmbedding()));

                    return Double.compare(sim2, sim1);
                })
                .limit(10)
                .collect(Collectors.toList());
    }

    private double[] parseEmbedding(String embedding) {

        String[] parts = embedding.split(",");

        double[] vector = new double[parts.length];

        for (int i = 0; i < parts.length; i++) {
            vector[i] = Double.parseDouble(parts[i]);
        }

        return vector;
    }

    private double cosineSimilarity(double[] a, double[] b) {

        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.length; i++) {

            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
