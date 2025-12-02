package com.carnetdigital.carnet_api.dto;

import com.carnetdigital.carnet_api.entity.User.UserRole;
import com.carnetdigital.carnet_api.entity.User.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {
    
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;
    private UserStatus status;
}
