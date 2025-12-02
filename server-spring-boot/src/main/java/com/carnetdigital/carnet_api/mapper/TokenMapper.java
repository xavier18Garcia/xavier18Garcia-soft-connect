package com.carnetdigital.carnet_api.mapper;

import com.carnetdigital.carnet_api.dto.*;
import com.carnetdigital.carnet_api.entity.Token;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TokenMapper {
    
    // Entity → Response DTO
    public TokenResponse toResponse(Token token) {
        if (token == null) return null;
        
        return TokenResponse.builder()
            .id(token.getId())
            .token(token.getToken())
            .tokenType(token.getTokenType())
            .used(token.getUsed())
            .expiresAt(token.getExpiresAt())
            .createdAt(token.getCreatedAt())
            .isExpired(token.isExpired())
            .isValid(token.isValid())
            .build();
    }
    
    // Entity → Detailed Response DTO
    public TokenDetailResponse toDetailResponse(Token token) {
        if (token == null) return null;
        
        return TokenDetailResponse.builder()
            .id(token.getId())
            .token(token.getToken())
            .tokenType(token.getTokenType())
            .used(token.getUsed())
            .userId(token.getUser() != null ? token.getUser().getId() : null)
            .userEmail(token.getUser() != null ? token.getUser().getEmail() : null)
            .expiresAt(token.getExpiresAt())
            .createdAt(token.getCreatedAt())
            .updatedAt(token.getUpdatedAt())
            .isExpired(token.isExpired())
            .isValid(token.isValid())
            .build();
    }
    
    // Entity → Validation Response DTO
    public TokenValidationResponse toValidationResponse(Token token, boolean isValid, String message) {
        if (token == null) {
            return TokenValidationResponse.builder()
                .valid(false)
                .message(message)
                .build();
        }
        
        return TokenValidationResponse.builder()
            .valid(isValid)
            .message(message)
            .userId(token.getUser() != null ? token.getUser().getId() : null)
            .userEmail(token.getUser() != null ? token.getUser().getEmail() : null)
            .tokenType(token.getTokenType())
            .expiresAt(token.getExpiresAt())
            .build();
    }
    
    // List conversions
    public List<TokenResponse> toResponseList(List<Token> tokens) {
        if (tokens == null) return null;
        return tokens.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    public List<TokenDetailResponse> toDetailResponseList(List<Token> tokens) {
        if (tokens == null) return null;
        return tokens.stream()
            .map(this::toDetailResponse)
            .collect(Collectors.toList());
    }
}
