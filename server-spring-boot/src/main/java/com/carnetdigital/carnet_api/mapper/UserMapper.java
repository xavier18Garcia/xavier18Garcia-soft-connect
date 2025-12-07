package com.carnetdigital.carnet_api.mapper;

import com.carnetdigital.carnet_api.dto.*;
import com.carnetdigital.carnet_api.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {
    
    // Entity → Response DTO
    public UserResponse toResponse(User user) {
        if (user == null) return null;
        
        return UserResponse.builder()
            .id(user.getId())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .role(user.getRole())
            .status(user.getStatus())
            .active(user.getActive())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
    
    // Entity → Detailed Response DTO
    public UserDetailResponse toDetailResponse(User user) {
        if (user == null) return null;
        
        int totalTokens = user.getTokens() != null ? user.getTokens().size() : 0;
        long activeTokensCount = user.getTokens() != null ? 
            user.getTokens().stream()
                .filter(t -> !t.getUsed() && !t.isExpired())
                .count() : 0;
        
        return UserDetailResponse.builder()
            .id(user.getId())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .role(user.getRole())
            .status(user.getStatus())
            .active(user.getActive())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .totalTokens(totalTokens)
            .activeTokens((int) activeTokensCount)
            .build();
    }
    
    // Entity → Summary Response DTO
    public UserSummaryResponse toSummaryResponse(User user) {
        if (user == null) return null;
        
        return UserSummaryResponse.builder()
            .id(user.getId())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .role(user.getRole())
            .status(user.getStatus())
            .build();
    }
    
    // Create Request DTO → Entity
    public User toEntity(UserCreateRequest request) {
        if (request == null) return null;
        
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole() != null ? request.getRole() : User.UserRole.student);
        return user;
    }
    
    // Update Request DTO → Update Entity
    public void updateEntity(User user, UserUpdateRequest request) {
        if (request == null) return;
        
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
    }
    
    // List conversions
    public List<UserResponse> toResponseList(List<User> users) {
        if (users == null) return null;
        return users.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    public List<UserSummaryResponse> toSummaryResponseList(List<User> users) {
        if (users == null) return null;
        return users.stream()
            .map(this::toSummaryResponse)
            .collect(Collectors.toList());
    }
}