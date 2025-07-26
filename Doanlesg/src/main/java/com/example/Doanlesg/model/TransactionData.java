package com.example.Doanlesg.model;


public class TransactionData {
    private long id;
    private String reference;
    private String description;
    private long amount;
    private long runningBalance;
    private String transactionDateTime;
    private String accountNumber;
    private String bankName;
    private String bankAbbreviation;
    private String virtualAccountNumber;
    private String virtualAccountName;
    private String counterAccountName;
    private String counterAccountNumber;
    private String counterAccountBankId;
    private String counterAccountBankName;

    // --- Getters and Setters for all fields ---
    // (Bắt buộc phải có để Jackson có thể hoạt động)

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public long getAmount() { return amount; }
    public void setAmount(long amount) { this.amount = amount; }
    public long getRunningBalance() { return runningBalance; }
    public void setRunningBalance(long runningBalance) { this.runningBalance = runningBalance; }
    public String getTransactionDateTime() { return transactionDateTime; }
    public void setTransactionDateTime(String transactionDateTime) { this.transactionDateTime = transactionDateTime; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getBankAbbreviation() { return bankAbbreviation; }
    public void setBankAbbreviation(String bankAbbreviation) { this.bankAbbreviation = bankAbbreviation; }
    public String getVirtualAccountNumber() { return virtualAccountNumber; }
    public void setVirtualAccountNumber(String virtualAccountNumber) { this.virtualAccountNumber = virtualAccountNumber; }
    public String getVirtualAccountName() { return virtualAccountName; }
    public void setVirtualAccountName(String virtualAccountName) { this.virtualAccountName = virtualAccountName; }
    public String getCounterAccountName() { return counterAccountName; }
    public void setCounterAccountName(String counterAccountName) { this.counterAccountName = counterAccountName; }
    public String getCounterAccountNumber() { return counterAccountNumber; }
    public void setCounterAccountNumber(String counterAccountNumber) { this.counterAccountNumber = counterAccountNumber; }
    public String getCounterAccountBankId() { return counterAccountBankId; }
    public void setCounterAccountBankId(String counterAccountBankId) { this.counterAccountBankId = counterAccountBankId; }
    public String getCounterAccountBankName() { return counterAccountBankName; }
    public void setCounterAccountBankName(String counterAccountBankName) { this.counterAccountBankName = counterAccountBankName; }

    @Override
    public String toString() {
        return "TransactionData{" +
                "id=" + id +
                ", reference='" + reference + '\'' +
                ", description='" + description + '\'' +
                ", amount=" + amount +
                ", transactionDateTime='" + transactionDateTime + '\'' +
                ", accountNumber='" + accountNumber + '\'' +
                '}';
    }
}
