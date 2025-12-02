package com.carnetdigital.carnet_api.dto;

import com.carnetdigital.carnet_api.entity.Token.TokenType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    
    private UUID id;
    private String token;
    private TokenType tokenType;
    private Boolean used;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private Boolean isExpired;
    private Boolean isValid;
}
