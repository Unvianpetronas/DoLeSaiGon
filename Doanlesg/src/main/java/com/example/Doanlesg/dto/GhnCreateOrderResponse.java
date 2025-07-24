package com.example.Doanlesg.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// DTO này hứng dữ liệu trả về từ GHN sau khi tạo đơn thành công
@Getter
@Setter
@ToString
public class GhnCreateOrderResponse {

    @JsonProperty("order_code")
    private String orderCode; // Đây là mã vận đơn quan trọng nhất cần lưu lại

    @JsonProperty("total_fee")
    private Double totalFee;

    @JsonProperty("data") // Trỏ đến đối tượng "data"
    private GhnResponseDataDTO data;
}