package com.example.Doanlesg.dto;

import com.example.Doanlesg.model.TransactionData;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CassoWebhookPayload {
    private int error;
    private TransactionData data;
}
