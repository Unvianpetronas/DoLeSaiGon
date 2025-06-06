package com.example.Doanlesg.model;

import lombok.Data;

@Data
public class TransactionResponseWrapper {
    private int error;
    private String message;
    private TransactionDataPayload data;
}
