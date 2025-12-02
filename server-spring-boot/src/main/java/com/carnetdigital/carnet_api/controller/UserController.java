package com.carnetdigital.carnet_api.controller;

import com.carnetdigital.carnet_api.dto.*;
import com.carnetdigital.carnet_api.entity.User.UserRole;
import com.carnetdigital.carnet_api.entity.User.UserStatus;
import com.carnetdigital.carnet_api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ==================== CREATE ====================
    
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    // ==================== READ ====================
    
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDetailResponse> getUserById(@PathVariable UUID id) {
        UserDetailResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        UserResponse user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable UserRole role) {
        List<UserResponse> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<UserResponse>> getUsersByStatus(@PathVariable UserStatus status) {
        List<UserResponse> users = userService.getUsersByStatus(status);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<UserResponse>> getActiveUsers() {
        List<UserResponse> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsersByName(@RequestParam String name) {
        List<UserResponse> users = userService.searchUsersByName(name);
        return ResponseEntity.ok(users);
    }

    // ==================== UPDATE ====================
    
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse user = userService.updateUser(id, request);
        return ResponseEntity.ok(user);
    }
    
    @PatchMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(
            @PathVariable UUID id,
            @Valid @RequestBody UserPasswordChangeRequest request) {
        userService.changePassword(id, request);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable UUID id) {
        userService.activateUser(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID id) {
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== DELETE ====================
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id); // Soft delete
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDeleteUser(@PathVariable UUID id) {
        userService.hardDeleteUser(id); // Hard delete
        return ResponseEntity.noContent().build();
    }

    // ==================== STATISTICS ====================
    
    @GetMapping("/count/role/{role}")
    public ResponseEntity<Long> countUsersByRole(@PathVariable UserRole role) {
        long count = userService.countUsersByRole(role);
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> countUsersByStatus(@PathVariable UserStatus status) {
        long count = userService.countUsersByStatus(status);
        return ResponseEntity.ok(count);
    }
}