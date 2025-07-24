package com.example.Doanlesg.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// Lớp này đại diện cho đối tượng "data" trong JSON trả về
@Getter
@Setter
@ToString
public class GhnResponseDataDTO {

    @JsonProperty("order_code")
    private String orderCode;

    @JsonProperty("total_fee")
    private String totalFee;
}