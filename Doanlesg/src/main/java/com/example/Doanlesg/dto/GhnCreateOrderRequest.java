package com.example.Doanlesg.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

// DTO này chứa các thông tin cần thiết để tạo một đơn hàng trên GHN
// Xem tài liệu API của GHN để biết đầy đủ các trường
@Getter
@Setter
public class GhnCreateOrderRequest {

    @JsonProperty("to_name")
    private String toName;

    @JsonProperty("to_phone")
    private String toPhone;

    @JsonProperty("to_address")
    private String toAddress;

    @JsonProperty("to_ward_code")
    private String toWardCode; // BẮT BUỘC

    @JsonProperty("to_district_id")
    private Integer toDistrictId; // BẮT BUỘC

    @JsonProperty("cod_amount")
    private Integer codAmount;

    @JsonProperty("weight")
    private Integer weight;

    @JsonProperty("length")
    private Integer length;

    @JsonProperty("width")
    private Integer width;

    @JsonProperty("height")
    private Integer height;

    @JsonProperty("service_id")
    private Integer serviceId;

    @JsonProperty("service_type_id")
    private Integer serviceTypeId;

    @JsonProperty("payment_type_id")
    private Integer paymentTypeId; // 1: Người mua trả phí, 2: Người bán trả phí

    @JsonProperty("note")
    private String note;

    @JsonProperty("required_note")
    private String requiredNote;

    @JsonProperty("content")
    private String content;

    @JsonProperty("items")
    private List<GhnItemDTO> items;
    // Thêm getters và setters cho tất cả các trường
}