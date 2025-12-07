package com.carnetdigital.carnet_api.controller;

import com.carnetdigital.carnet_api.dto.*;
import com.carnetdigital.carnet_api.entity.User;
import com.carnetdigital.carnet_api.helpers.ApiResponseFactory;
import com.carnetdigital.carnet_api.repository.UserRepository;
import com.carnetdigital.carnet_api.service.JwtService;
import com.carnetdigital.carnet_api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ==================== REGISTER ====================
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody UserCreateRequest request) {
        UserResponse user = userService.createUser(request);
        return ApiResponseFactory.created(user, "Usuario registrado exitosamente");
    }

    // ==================== LOGIN ====================
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthTokenResponse>> login(@Valid @RequestBody UserLoginRequest request) {
        // Buscar usuario por email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciales no válidas"));

        // Verificar password con BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Credenciales no válidas");
        }

        // Verificar que el usuario esté activo
        if (!user.getActive()) {
            throw new RuntimeException("User account is inactive");
        }

        // ✅ Generar JWT tokens (NO se guardan en BD)
        String accessToken = jwtService.generateAccessToken(
            user.getEmail(), 
            user.getId(), 
            user.getRole().name()
        );
        
        String refreshToken = jwtService.generateRefreshToken(
            user.getEmail(), 
            user.getId()
        );

        // Construir respuesta
        AuthTokenResponse authResponse = AuthTokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(86400L) // 24 horas en segundos
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

        return ApiResponseFactory.success(
            authResponse, 
            "Inicio de sesión exitoso", 
            null
        );
    }

    // ==================== REFRESH TOKEN ====================
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthTokenResponse>> refreshToken(
            @Valid @RequestBody TokenRefreshRequest request) {
        
        String refreshToken = request.getRefreshToken();

        try {
            // ✅ Validar que sea un refresh token
            if (!jwtService.isRefreshToken(refreshToken)) {
                throw new RuntimeException("Token no es un refresh token");
            }

            // ✅ Extraer información del JWT
            String email = jwtService.extractEmail(refreshToken);

            // Buscar usuario
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // ✅ Validar token JWT
            if (!jwtService.validateToken(refreshToken, email)) {
                throw new RuntimeException("Refresh token inválido o expirado");
            }

            // ✅ Generar nuevo access token
            String newAccessToken = jwtService.generateAccessToken(
                user.getEmail(), 
                user.getId(), 
                user.getRole().name()
            );

            // Construir respuesta
            AuthTokenResponse authResponse = AuthTokenResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(refreshToken) // El refresh token sigue siendo el mismo
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

            return ApiResponseFactory.success(
                authResponse, 
                "Token renovado exitosamente", 
                null
            );
            
        } catch (Exception e) {
            throw new RuntimeException("Error al renovar token: " + e.getMessage());
        }
    }

    // ==================== LOGOUT ====================
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String authHeader) {
        // ✅ Con JWT, el logout se maneja en el cliente eliminando el token
        // Si quieres implementar blacklist, necesitarías Redis o una tabla en BD
        
        // Extraer token del header
        String token = authHeader.replace("Bearer ", "");

        // Validar que el token sea válido antes de hacer logout
        try {
            if (jwtService.isTokenExpired(token)) {
                throw new RuntimeException("Token ya expirado");
            }
            
            // Aquí podrías agregar el token a una blacklist en Redis
            // redisTemplate.opsForValue().set("blacklist:" + token, "true", expirationTime);
            
        } catch (Exception e) {
            // Si el token es inválido, igual permitimos el logout
            System.out.println("Token inválido durante logout: " + e.getMessage());
        }

        return ApiResponseFactory.success(
            null, 
            "Sesión cerrada exitosamente", 
            null
        );
    }

    // ==================== ME (Get Current User) ====================
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {
        
        // Extraer token del header
        String token = authHeader.replace("Bearer ", "");

        try {
            // ✅ Validar que sea un access token
            if (!jwtService.isAccessToken(token)) {
                throw new RuntimeException("Token no es un access token");
            }

            // ✅ Extraer email del JWT
            String email = jwtService.extractEmail(token);

            // ✅ Validar que el token no esté expirado
            if (jwtService.isTokenExpired(token)) {
                throw new RuntimeException("Token expirado");
            }

            // Obtener usuario desde la BD
            UserResponse user = userService.getUserByEmail(email);

            return ApiResponseFactory.success(
                user, 
                "Usuario recuperado con éxito", 
                null
            );
            
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener usuario: " + e.getMessage());
        }
    }
}