package com.example.Doanlesg;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

//import org.springframework.context.annotation.Bean;
//import org.springframework.boot.CommandLineRunner;
//import com.example.Doanlesg.services.ProductService;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)

public class DoanlesgApplication {

	public static void main(String[] args) {
		SpringApplication.run(DoanlesgApplication.class, args);

	}

//	@Bean
//	CommandLineRunner generateEmbeddings(ProductService productService) {
//		return args -> {
//			System.out.println("Generating embeddings for products...");
//			productService.generateEmbeddingsForAllProducts();
//			System.out.println("Embedding generation completed.");
//		};
//	}
	//test123
}
