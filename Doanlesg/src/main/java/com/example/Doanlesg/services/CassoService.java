package com.example.Doanlesg.services;

import com.example.Doanlesg.model.TransactionRecordDTO;
import com.example.Doanlesg.model.TransactionResponseWrapper;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;

public interface CassoService {
    Mono<TransactionResponseWrapper> getTransactionFiltered(int page, int pageSize, LocalDateTime fromDate);
    Mono<List<TransactionRecordDTO>> fetchAllTransaction();

}
