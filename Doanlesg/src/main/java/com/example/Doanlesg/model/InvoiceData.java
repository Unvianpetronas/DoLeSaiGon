package com.example.Doanlesg.model;

import java.util.List;

public record InvoiceData(
        String invoiceNumber,
        String issueDate,
        String fromInfo,
        String toInfo,
        List<Item> items,
        double total,
        String logoBase64) {
    public record Item(String name, int quantity, double unitCost) {}
}
