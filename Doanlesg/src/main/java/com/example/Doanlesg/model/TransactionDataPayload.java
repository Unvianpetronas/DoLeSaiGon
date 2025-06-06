package com.example.Doanlesg.model;

import lombok.Data;

import java.util.List;

@Data
public class TransactionDataPayload {
    private int page;
    private int pageSize;
    private int nextPage;
    private int prevPage;
    private int totalPages;
    private int totalRecords;
    private List<TransactionRecordDTO> records;
}
