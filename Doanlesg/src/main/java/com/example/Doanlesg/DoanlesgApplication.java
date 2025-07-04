package com.example.Doanlesg;

import com.example.Doanlesg.model.InvoiceData;
import com.example.Doanlesg.services.InvoiceService;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class DoanlesgApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
		System.setProperty("casso.api.key", dotenv.get("CASSO_API_KEY"));
		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
		SpringApplication.run(DoanlesgApplication.class, args);
	}
	//test123
}
