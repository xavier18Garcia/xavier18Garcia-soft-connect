package com.carnetdigital.carnet_api.dto;

import com.carnetdigital.carnet_api.entity.User.UserRole;
import com.carnetdigital.carnet_api.entity.User.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    
    @Size(max = 42, message = "First name must not exceed 42 characters")
    private String firstName;
    
    @Size(max = 42, message = "Last name must not exceed 42 characters")
    private String lastName;
    
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;
    
    private UserStatus status;

    private UserRole role;
    
    private Boolean active;
}
