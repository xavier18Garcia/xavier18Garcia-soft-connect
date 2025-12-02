package com.carnetdigital.carnet_api.dto;

import com.carnetdigital.carnet_api.entity.Token.TokenType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
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
public class TokenCreateRequest {
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    @NotNull(message = "Token type is required")
    private TokenType tokenType;
    
    @Future(message = "Expiration date must be in the future")
    private LocalDateTime expiresAt;
}
