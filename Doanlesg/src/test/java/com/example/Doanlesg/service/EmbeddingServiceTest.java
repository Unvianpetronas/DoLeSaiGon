package com.example.Doanlesg.service;

import com.example.Doanlesg.services.EmbeddingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = EmbeddingService.class)
public class EmbeddingServiceTest {

    @Autowired
    private EmbeddingService embeddingService;

    @Test
    public void testEmbeddingGeneration() {

        String text = "Chuột gaming RGB không dây";

        double[] embedding = embeddingService.generateEmbedding(text);

        System.out.println("Vector length: " + embedding.length);
        System.out.println("First value: " + embedding[0]);

        assertNotNull(embedding);
        assertTrue(embedding.length > 0);
    }
}
