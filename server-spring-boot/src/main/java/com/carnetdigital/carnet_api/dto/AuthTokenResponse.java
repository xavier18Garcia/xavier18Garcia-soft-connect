package com.carnetdigital.carnet_api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthTokenResponse {
    
    private String accessToken;
    private String refreshToken;
    private Long expiresIn; // segundos
    @Builder.Default
    private String tokenType = "Bearer";
    private UserSummaryResponse user;
}
