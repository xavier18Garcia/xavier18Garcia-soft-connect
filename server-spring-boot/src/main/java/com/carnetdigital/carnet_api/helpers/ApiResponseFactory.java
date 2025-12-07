package com.carnetdigital.carnet_api.helpers;

import com.carnetdigital.carnet_api.dto.*;

import java.util.Map;

import org.springframework.http.ResponseEntity;

public class ApiResponseFactory {

    public static <T> ResponseEntity<ApiResponse<T>> success(
            T data,
            String message,
            Map<String, Object> meta
    ) {
        ApiResponse<T> response = new ApiResponse<>(
                "success",
                200,
                message,
                data,
                meta
        );

        return ResponseEntity.ok(response);
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(T data, String message) {
        ApiResponse<T> response = new ApiResponse<>(
                "success",
                201,
                message,
                data,
                null
        );

        return ResponseEntity.status(201).body(response);
    }
}
