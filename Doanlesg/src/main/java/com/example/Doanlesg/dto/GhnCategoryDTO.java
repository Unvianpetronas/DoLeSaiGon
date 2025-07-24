package com.example.Doanlesg.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GhnCategoryDTO {
    @JsonProperty("level1")
    private String level1;

    // Getters and Setters
    public String getLevel1() { return level1; }
    public void setLevel1(String level1) { this.level1 = level1; }
}