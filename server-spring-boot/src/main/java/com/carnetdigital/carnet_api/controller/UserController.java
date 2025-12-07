package com.carnetdigital.carnet_api.controller;

import com.carnetdigital.carnet_api.dto.*;
import com.carnetdigital.carnet_api.entity.User.UserRole;
import com.carnetdigital.carnet_api.entity.User.UserStatus;
import com.carnetdigital.carnet_api.service.UserService;
import com.carnetdigital.carnet_api.helpers.ApiResponseFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ==================== CREATE ====================
    
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse user = userService.createUser(request);
        return ApiResponseFactory.created(user, "Usuario creado con éxito");
    }

    // ==================== READ ====================
    
    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        // Si page o size están presentes, usar paginación
        if (page != null && size != null) {
            PagedResponse<UserResponse> users = userService.getAllUsersIncludingDeleted(page, size, sortBy, sortDirection);
            return ApiResponseFactory.success(
                users,
                "Usuarios recuperados exitosamente",
                Map.of(
                    "paginated", true,
                    "sortBy", sortBy,
                    "sortDirection", sortDirection
                )
            );
        } else {
            // Sin paginación (todos los registros)
            List<UserResponse> users = userService.getAllUsers();
            return ApiResponseFactory.success(
                users,
                "Usuarios recuperados exitosamente",
                Map.of(
                    "paginated", false,
                    "totalRecords", users.size()
                )
            );
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUserById(@PathVariable UUID id) {
        UserDetailResponse user = userService.getUserById(id);
        return ApiResponseFactory.success(user, "Usuario recuperado con éxito", null);
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@PathVariable String email) {
        UserResponse user = userService.getUserByEmail(email);
        return ApiResponseFactory.success(user, "Usuario recuperado con éxito", null);
    }
    
    @GetMapping("/role/{role}")
    public ResponseEntity<?> getUsersByRole(
            @PathVariable UserRole role,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        if (page != null && size != null) {
            PagedResponse<UserResponse> users = userService.getUsersByRole(role, page, size);
            return ApiResponseFactory.success(
                users, 
                "Usuarios recuperados exitosamente", 
                Map.of("role", role.name(), "paginated", true)
            );
        } else {
            List<UserResponse> users = userService.getUsersByRole(role);
            return ApiResponseFactory.success(
                users, 
                "Usuarios recuperados exitosamente", 
                Map.of("role", role.name(), "count", users.size(), "paginated", false)
            );
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getUsersByStatus(
            @PathVariable UserStatus status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        if (page != null && size != null) {
            PagedResponse<UserResponse> users = userService.getUsersByStatus(status, page, size);
            return ApiResponseFactory.success(
                users, 
                "Usuarios recuperados exitosamente", 
                Map.of("status", status.name(), "paginated", true)
            );
        } else {
            List<UserResponse> users = userService.getUsersByStatus(status);
            return ApiResponseFactory.success(
                users, 
                "Usuarios recuperados exitosamente", 
                Map.of("status", status.name(), "count", users.size(), "paginated", false)
            );
        }
    }
    
    @GetMapping("/active")
    public ResponseEntity<?> getActiveUsers(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        if (page != null && size != null) {
            PagedResponse<UserResponse> users = userService.getActiveUsers(page, size);
            return ApiResponseFactory.success(
                users, 
                "Usuarios activos recuperados con éxito", 
                Map.of("paginated", true)
            );
        } else {
            List<UserResponse> users = userService.getActiveUsers();
            return ApiResponseFactory.success(
                users, 
                "Usuarios activos recuperados con éxito", 
                Map.of("count", users.size(), "paginated", false)
            );
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchUsersByName(
            @RequestParam String q,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        if (page != null && size != null) {
            PagedResponse<UserResponse> users = userService.searchUsersByName(q, page, size, sortBy, sortDirection);
            return ApiResponseFactory.success(
                users, 
                "Usuarios encontrados exitosamente", 
                Map.of("searchTerm", q, "paginated", true)
            );
        } else {
            List<UserResponse> users = userService.searchUsersByName(q);
            return ApiResponseFactory.success(
                users, 
                "Usuarios encontrados exitosamente", 
                Map.of("searchTerm", q, "count", users.size(), "paginated", false)
            );
        }
    }

    // ==================== UPDATE ====================
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse user = userService.updateUser(id, request);
        return ApiResponseFactory.success(user, "Usuario actualizado con éxito", null);
    }
    
    @PatchMapping("/{id}/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable UUID id,
            @Valid @RequestBody UserPasswordChangeRequest request) {
        userService.changePassword(id, request);
        return ApiResponseFactory.success(null, "La contraseña se cambió correctamente", null);
    }
    
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable UUID id) {
        userService.activateUser(id);
        return ApiResponseFactory.success(null, "Usuario activado exitosamente", null);
    }
    
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable UUID id) {
        userService.deactivateUser(id);
        return ApiResponseFactory.success(null, "Usuario desactivado con éxito", null);
    }

    // ==================== DELETE ====================
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ApiResponseFactory.success(null, "Usuario removido exitosamente", null);
    }
    
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<ApiResponse<Void>> hardDeleteUser(@PathVariable UUID id) {
        userService.hardDeleteUser(id);
        return ApiResponseFactory.success(null, "Usuario eliminado permanentemente", null);
    }

    // ==================== STATISTICS ====================
    
    @GetMapping("/count/role/{role}")
    public ResponseEntity<ApiResponse<Long>> countUsersByRole(@PathVariable UserRole role) {
        long count = userService.countUsersByRole(role);
        return ApiResponseFactory.success(
            count, 
            "Conteo recuperado exitosamente", 
            Map.of("role", role.name())
        );
    }
    
    @GetMapping("/count/status/{status}")
    public ResponseEntity<ApiResponse<Long>> countUsersByStatus(@PathVariable UserStatus status) {
        long count = userService.countUsersByStatus(status);
        return ApiResponseFactory.success(
            count, 
            "Conteo recuperado exitosamente", 
            Map.of("status", status.name())
        );
    }
}