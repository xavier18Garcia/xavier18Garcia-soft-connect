package com.carnetdigital.carnet_api.service;

import com.carnetdigital.carnet_api.dto.*;
import com.carnetdigital.carnet_api.entity.Token;
import com.carnetdigital.carnet_api.entity.Token.TokenType;
import com.carnetdigital.carnet_api.entity.User;
import com.carnetdigital.carnet_api.mapper.TokenMapper;
import com.carnetdigital.carnet_api.repository.TokenRepository;
import com.carnetdigital.carnet_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final TokenMapper tokenMapper;

    @Transactional
    public TokenResponse createToken(TokenCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        Token token = new Token();
        token.setUser(user);
        token.setTokenType(request.getTokenType());
        token.setToken(generateTokenString()); // Generar token único
        
        // Si no se especifica expiresAt, se configurará automáticamente en @PrePersist
        if (request.getExpiresAt() != null) {
            token.setExpiresAt(request.getExpiresAt());
        }

        Token savedToken = tokenRepository.save(token);
        return tokenMapper.toResponse(savedToken);
    }

    @Transactional(readOnly = true)
    public TokenDetailResponse getTokenById(UUID id) {
        Token token = tokenRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Token not found with id: " + id));
        return tokenMapper.toDetailResponse(token);
    }

    @Transactional(readOnly = true)
    public TokenDetailResponse getTokenByValue(String tokenValue) {
        Token token = tokenRepository.findByToken(tokenValue)
            .orElseThrow(() -> new RuntimeException("Token not found"));
        return tokenMapper.toDetailResponse(token);
    }

    @Transactional(readOnly = true)
    public List<TokenResponse> getUserTokens(UUID userId) {
        return tokenRepository.findByUserId(userId).stream()
            .map(tokenMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TokenResponse> getActiveUserTokens(UUID userId) {
        return tokenRepository.findByUserIdAndUsedFalse(userId).stream()
            .map(tokenMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TokenResponse> getActiveTokens() {
        return tokenRepository.findActiveTokens(LocalDateTime.now()).stream()
            .map(tokenMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public TokenValidationResponse validateToken(TokenValidateRequest request) {
        Token token = tokenRepository.findByToken(request.getToken())
            .orElse(null);

        if (token == null) {
            return tokenMapper.toValidationResponse(null, false, "Token not found");
        }

        if (token.getUsed()) {
            return tokenMapper.toValidationResponse(token, false, "Token already used");
        }

        if (token.isExpired()) {
            return tokenMapper.toValidationResponse(token, false, "Token expired");
        }

        return tokenMapper.toValidationResponse(token, true, "Token is valid");
    }

    @Transactional
    public void markTokenAsUsed(UUID tokenId) {
        Token token = tokenRepository.findById(tokenId)
            .orElseThrow(() -> new RuntimeException("Token not found with id: " + tokenId));
        token.setUsed(true);
        tokenRepository.save(token);
    }

    @Transactional
    public void markTokenAsUsedByValue(String tokenValue) {
        Token token = tokenRepository.findByToken(tokenValue)
            .orElseThrow(() -> new RuntimeException("Token not found"));
        token.setUsed(true);
        tokenRepository.save(token);
    }

    @Transactional
    public void invalidateUserTokens(UUID userId) {
        tokenRepository.invalidateAllUserTokens(userId);
    }

    @Transactional
    public void invalidateUserTokensByType(UUID userId, TokenType tokenType) {
        tokenRepository.invalidateUserTokensByType(userId, tokenType);
    }

    @Transactional
    public void deleteToken(UUID tokenId) {
        Token token = tokenRepository.findById(tokenId)
            .orElseThrow(() -> new RuntimeException("Token not found with id: " + tokenId));
        tokenRepository.delete(token); // Soft delete
    }

    @Transactional
    public int cleanExpiredTokens() {
        return tokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }

    // Tarea programada para limpiar tokens expirados (cada día a las 2 AM)
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void scheduledCleanup() {
        int deleted = cleanExpiredTokens();
        System.out.println("Cleaned up " + deleted + " expired tokens");
    }

    @Transactional(readOnly = true)
    public boolean isTokenValid(String tokenValue) {
        return tokenRepository.existsValidToken(tokenValue, LocalDateTime.now());
    }

    // Método auxiliar para generar token único
    private String generateTokenString() {
        return UUID.randomUUID().toString().replace("-", "") + 
               UUID.randomUUID().toString().replace("-", "");
    }

    // =============== MÉTODOS PARA AUTENTICACIÓN JWT (Opcional) ===============

    @Transactional
    public AuthTokenResponse generateAuthTokens(User user) {
        // Invalidar tokens anteriores del mismo tipo
        invalidateUserTokensByType(user.getId(), TokenType.access);
        invalidateUserTokensByType(user.getId(), TokenType.refresh);

        // Crear access token
        Token accessToken = new Token();
        accessToken.setUser(user);
        accessToken.setTokenType(TokenType.access);
        accessToken.setToken(generateTokenString());
        tokenRepository.save(accessToken);

        // Crear refresh token
        Token refreshToken = new Token();
        refreshToken.setUser(user);
        refreshToken.setTokenType(TokenType.refresh);
        refreshToken.setToken(generateTokenString());
        tokenRepository.save(refreshToken);

        return AuthTokenResponse.builder()
            .accessToken(accessToken.getToken())
            .refreshToken(refreshToken.getToken())
            .expiresIn(86400L) // 1 día en segundos
            .tokenType("Bearer")
            .user(UserSummaryResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build())
            .build();
    }

    @Transactional
    public AuthTokenResponse refreshAccessToken(TokenRefreshRequest request) {
        Token refreshToken = tokenRepository.findByToken(request.getRefreshToken())
            .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (!refreshToken.isValid()) {
            throw new RuntimeException("Refresh token is invalid or expired");
        }

        if (refreshToken.getTokenType() != TokenType.refresh) {
            throw new RuntimeException("Token is not a refresh token");
        }

        // Generar nuevo access token
        User user = refreshToken.getUser();
        
        Token newAccessToken = new Token();
        newAccessToken.setUser(user);
        newAccessToken.setTokenType(TokenType.access);
        newAccessToken.setToken(generateTokenString());
        tokenRepository.save(newAccessToken);

        return AuthTokenResponse.builder()
            .accessToken(newAccessToken.getToken())
            .refreshToken(refreshToken.getToken())
            .expiresIn(86400L)
            .tokenType("Bearer")
            .user(UserSummaryResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build())
            .build();
    }
}