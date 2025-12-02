package com.carnetdigital.carnet_api.dto;

import com.carnetdigital.carnet_api.entity.User.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateRequest {
    
    @Size(max = 42, message = "First name must not exceed 42 characters")
    private String firstName;
    
    @Size(max = 42, message = "Last name must not exceed 42 characters")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 60, message = "Password must be between 8 and 60 characters")
    private String password;
    
    private UserRole role;
}