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
    
    @Size(max = 42, message = "El nombre no debe exceder los 42 caracteres")
    private String firstName;
    
    @Size(max = 42, message = "El apellido no debe exceder los 42 caracteres")
    private String lastName;
    
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo debe ser válido")
    @Size(max = 100, message = "El correo no debe exceder los 100 caracteres")
    private String email;
    
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 60, message = "La contraseña debe tener entre 8 y 60 caracteres")
    private String password;
    
    private UserRole role;
}
