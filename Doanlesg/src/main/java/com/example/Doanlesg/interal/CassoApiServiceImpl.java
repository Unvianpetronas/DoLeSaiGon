package com.example.Doanlesg.interal;

import com.example.Doanlesg.model.TransactionRecordDTO;
import com.example.Doanlesg.model.TransactionResponseWrapper;
import com.example.Doanlesg.services.CassoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class CassoApiServiceImpl implements CassoService {

    private final WebClient webClient;
    @Value("${CASSO_API_KEY}")
    private String cassoApiKey;
    private static final String CASSO_API_BASE_URL = "https://oauth.casso.vn";

    public CassoApiServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl(CASSO_API_BASE_URL)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public Mono<TransactionResponseWrapper> getTransactionFiltered(int page, int pageSize, LocalDateTime fromDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        return this.webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/v2/transactions")
                            .queryParam("page", page)
                            .queryParam("pageSize", pageSize)
                            .queryParam("sort", "ASC");

                    if (fromDate != null) {
                        uriBuilder.queryParam("fromDate", fromDate.format(formatter));
                    }
                    return uriBuilder.build();
                })
                .header(HttpHeaders.AUTHORIZATION, "apikey " + cassoApiKey)
                .retrieve()
                .bodyToMono(TransactionResponseWrapper.class)
                .retry(3);
    }

    @Override
    public Mono<List<TransactionRecordDTO>> fetchAllTransaction() {
        return null;
    }
}
