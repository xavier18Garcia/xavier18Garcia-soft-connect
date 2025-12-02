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
public class TokenValidationResponse {
    
    private Boolean valid;
    private String message;
    private UUID userId;
    private String userEmail;
    private TokenType tokenType;
    private LocalDateTime expiresAt;
}
