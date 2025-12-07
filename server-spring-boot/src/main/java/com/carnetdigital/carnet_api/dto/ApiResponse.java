package com.carnetdigital.carnet_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private String status;
    private int code;
    private String message;
    private T data;
    private Object meta;
}
