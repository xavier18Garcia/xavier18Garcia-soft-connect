package com.carnetdigital.carnet_api.controller;

import com.carnetdigital.carnet_api.dto.*;
import com.carnetdigital.carnet_api.entity.Token.TokenType;
import com.carnetdigital.carnet_api.service.TokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tokens")
@RequiredArgsConstructor
public class TokenController {

    private final TokenService tokenService;

    // ==================== CREATE ====================
    
    @PostMapping
    public ResponseEntity<TokenResponse> createToken(@Valid @RequestBody TokenCreateRequest request) {
        TokenResponse token = tokenService.createToken(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(token);
    }

    // ==================== READ ====================
    
    @GetMapping("/{id}")
    public ResponseEntity<TokenDetailResponse> getTokenById(@PathVariable UUID id) {
        TokenDetailResponse token = tokenService.getTokenById(id);
        return ResponseEntity.ok(token);
    }
    
    @GetMapping("/value/{tokenValue}")
    public ResponseEntity<TokenDetailResponse> getTokenByValue(@PathVariable String tokenValue) {
        TokenDetailResponse token = tokenService.getTokenByValue(tokenValue);
        return ResponseEntity.ok(token);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TokenResponse>> getUserTokens(@PathVariable UUID userId) {
        List<TokenResponse> tokens = tokenService.getUserTokens(userId);
        return ResponseEntity.ok(tokens);
    }
    
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<TokenResponse>> getActiveUserTokens(@PathVariable UUID userId) {
        List<TokenResponse> tokens = tokenService.getActiveUserTokens(userId);
        return ResponseEntity.ok(tokens);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<TokenResponse>> getActiveTokens() {
        List<TokenResponse> tokens = tokenService.getActiveTokens();
        return ResponseEntity.ok(tokens);
    }

    // ==================== VALIDATE ====================
    
    @PostMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validateToken(
            @Valid @RequestBody TokenValidateRequest request) {
        TokenValidationResponse validation = tokenService.validateToken(request);
        return ResponseEntity.ok(validation);
    }
    
    @GetMapping("/check/{tokenValue}")
    public ResponseEntity<Boolean> isTokenValid(@PathVariable String tokenValue) {
        boolean isValid = tokenService.isTokenValid(tokenValue);
        return ResponseEntity.ok(isValid);
    }

    // ==================== UPDATE ====================
    
    @PatchMapping("/{id}/use")
    public ResponseEntity<Void> markTokenAsUsed(@PathVariable UUID id) {
        tokenService.markTokenAsUsed(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/use/{tokenValue}")
    public ResponseEntity<Void> markTokenAsUsedByValue(@PathVariable String tokenValue) {
        tokenService.markTokenAsUsedByValue(tokenValue);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/user/{userId}/invalidate")
    public ResponseEntity<Void> invalidateUserTokens(@PathVariable UUID userId) {
        tokenService.invalidateUserTokens(userId);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/user/{userId}/invalidate/{tokenType}")
    public ResponseEntity<Void> invalidateUserTokensByType(
            @PathVariable UUID userId,
            @PathVariable TokenType tokenType) {
        tokenService.invalidateUserTokensByType(userId, tokenType);
        return ResponseEntity.noContent().build();
    }

    // ==================== DELETE ====================
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteToken(@PathVariable UUID id) {
        tokenService.deleteToken(id);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/expired")
    public ResponseEntity<Integer> cleanExpiredTokens() {
        int deleted = tokenService.cleanExpiredTokens();
        return ResponseEntity.ok(deleted);
    }

    // ==================== AUTHENTICATION ====================
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthTokenResponse> refreshToken(
            @Valid @RequestBody TokenRefreshRequest request) {
        AuthTokenResponse response = tokenService.refreshAccessToken(request);
        return ResponseEntity.ok(response);
    }
}