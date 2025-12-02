package com.carnetdigital.carnet_api.controller;

import com.carnetdigital.carnet_api.dto.*;
import com.carnetdigital.carnet_api.dto.UserCreateRequest;
import com.carnetdigital.carnet_api.dto.UserLoginRequest;
import com.carnetdigital.carnet_api.dto.UserResponse;
import com.carnetdigital.carnet_api.entity.User;
import com.carnetdigital.carnet_api.repository.UserRepository;
import com.carnetdigital.carnet_api.service.TokenService;
import com.carnetdigital.carnet_api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final TokenService tokenService;
    private final UserRepository userRepository;

    // ==================== REGISTER ====================
    
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserCreateRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    // ==================== LOGIN ====================
    
    @PostMapping("/login")
    public ResponseEntity<AuthTokenResponse> login(@Valid @RequestBody UserLoginRequest request) {
        // Buscar usuario por email
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        //     throw new RuntimeException("Invalid credentials");
        // }
        
        // Por ahora, comparación simple (CAMBIAR EN PRODUCCIÓN)
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Verificar que el usuario esté activo
        if (!user.getActive()) {
            throw new RuntimeException("User account is inactive");
        }

        // Generar tokens de autenticación
        AuthTokenResponse authResponse = tokenService.generateAuthTokens(user);
        return ResponseEntity.ok(authResponse);
    }

    // ==================== LOGOUT ====================
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authHeader) {
        // Extraer token del header "Bearer {token}"
        String token = authHeader.replace("Bearer ", "");
        
        // Marcar el token como usado
        tokenService.markTokenAsUsedByValue(token);
        
        return ResponseEntity.noContent().build();
    }

    // ==================== ME (Get Current User) ====================
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        // Extraer token del header
        String token = authHeader.replace("Bearer ", "");
        
        // Validar token y obtener usuario
        var tokenDetail = tokenService.getTokenByValue(token);
        
        if (!tokenDetail.getIsValid()) {
            throw new RuntimeException("Invalid or expired token");
        }
        
        UserResponse user = userService.getUserByEmail(tokenDetail.getUserEmail());
        return ResponseEntity.ok(user);
    }
}