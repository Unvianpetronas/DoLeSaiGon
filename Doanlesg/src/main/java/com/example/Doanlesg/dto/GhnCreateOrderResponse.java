package com.example.Doanlesg.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

// DTO này hứng dữ liệu trả về từ GHN sau khi tạo đơn thành công
@Getter
@Setter
public class GhnCreateOrderResponse {

    @JsonProperty("order_code")
    private String orderCode; // Đây là mã vận đơn quan trọng nhất cần lưu lại

    @JsonProperty("total_fee")
    private Double totalFee;

    // Thêm getters và setters
    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }

    public Double getTotalFee() {
        return totalFee;
    }

    public void setTotalFee(Double totalFee) {
        this.totalFee = totalFee;
    }
}