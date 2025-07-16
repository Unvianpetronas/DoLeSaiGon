package com.example.Doanlesg.dto;

public class ApiResponse {
    private boolean success;
    private String message;

    public ApiResponse(boolean b, String s) {
        this.success = b;
        this.message = s;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
