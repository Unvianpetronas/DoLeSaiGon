package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TransactionRecordDTO {
    private long id;
    private String tid;
    private String description;
    private long amount;
    private long cusumBalance;
    private LocalDateTime when;

    @JsonProperty("bankSubAccId")
    private String bankSubAccId;

    private long accountId;
    private String bankCodeName;
}
