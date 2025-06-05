package com.example.demo.service;

import com.example.demo.model.TransactionRecordDTO;
import com.example.demo.model.TransactionResponseWrapper;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;

public interface CassoService {
    Mono<TransactionResponseWrapper> getTransactionFiltered(int page, int pageSize, LocalDateTime fromDate);
    Mono<List<TransactionRecordDTO>> fetchAllTransaction();

}
