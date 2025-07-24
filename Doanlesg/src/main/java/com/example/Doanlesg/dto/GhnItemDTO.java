package com.example.Doanlesg.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GhnItemDTO {
    @JsonProperty("name")
    private String name;

    @JsonProperty("code")
    private String code; // Thêm code (mã sản phẩm/SKU)

    @JsonProperty("quantity")
    private Integer quantity;

    @JsonProperty("price")
    private Integer price;

    @JsonProperty("category")
    private GhnCategoryDTO category; // Thêm category

}