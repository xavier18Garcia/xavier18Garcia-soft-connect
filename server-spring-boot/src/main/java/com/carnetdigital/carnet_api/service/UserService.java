package com.carnetdigital.carnet_api.service;

import com.carnetdigital.carnet_api.dto.*;
import com.carnetdigital.carnet_api.entity.User;
import com.carnetdigital.carnet_api.entity.User.UserRole;
import com.carnetdigital.carnet_api.entity.User.UserStatus;
import com.carnetdigital.carnet_api.mapper.UserMapper;
import com.carnetdigital.carnet_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        // Verificar si el email existe incluyendo usuarios eliminados
        if (userRepository.existsByEmailIncludingDeleted(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public UserDetailResponse getUserById(UUID id) {
        User user = userRepository.findByIdIncludingDeleted(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return userMapper.toDetailResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmailIncludingDeleted(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return userMapper.toResponse(user);
    }

    // GET ALL - SIN PAGINACIÓN (excluye eliminados - comportamiento por defecto)
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
    }

    // GET ALL - SIN PAGINACIÓN (INCLUYENDO ELIMINADOS)
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsersIncludingDeleted() {
        return userRepository.findAllIncludingDeleted().stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
    }

    // GET ALL - CON PAGINACIÓN (excluye eliminados - comportamiento por defecto)
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<User> userPage = userRepository.findAllIncludingDeleted(pageable);
        
        return mapToPagedResponse(userPage);
    }

    // GET ALL - CON PAGINACIÓN (INCLUYENDO ELIMINADOS)
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsersIncludingDeleted(int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<User> userPage = userRepository.findAllIncludingDeleted(pageable);
        
        return mapToPagedResponse(userPage);
    }

    // USUARIOS ELIMINADOS - SIN PAGINACIÓN
    @Transactional(readOnly = true)
    public List<UserResponse> getDeletedUsers() {
        return userRepository.findDeletedUsers().stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
    }

    // USUARIOS ELIMINADOS - CON PAGINACIÓN
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getDeletedUsers(int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<User> userPage = userRepository.findDeletedUsers(pageable);
        
        return mapToPagedResponse(userPage);
    }

    // BÚSQUEDA - SIN PAGINACIÓN (excluye eliminados)
    @Transactional(readOnly = true)
    public List<UserResponse> searchUsersByName(String name) {
        return userRepository.searchByName(name).stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
    }

    // BÚSQUEDA - SIN PAGINACIÓN (INCLUYENDO ELIMINADOS)
    @Transactional(readOnly = true)
    public List<UserResponse> searchUsersByNameIncludingDeleted(String name) {
        return userRepository.searchByNameIncludingDeleted(name).stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
    }

    // BÚSQUEDA - CON PAGINACIÓN (excluye eliminados)
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> searchUsersByName(String name, int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<User> userPage = userRepository.searchByName(name, pageable);
        
        return mapToPagedResponse(userPage);
    }

    // BÚSQUEDA - CON PAGINACIÓN (INCLUYENDO ELIMINADOS)
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> searchUsersByNameIncludingDeleted(String name, int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<User> userPage = userRepository.searchByNameIncludingDeleted(name, pageable);
        
        return mapToPagedResponse(userPage);
    }

    // BY ROLE - SIN PAGINACIÓN (excluye eliminados)
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
    }

    // BY ROLE - SIN PAGINACIÓN (INCLUYENDO ELIMINADOS)
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRoleIncludingDeleted(UserRole role) {
        return userRepository.findByRoleIncludingDeleted(role).stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
    }

    // BY ROLE - CON PAGINACIÓN (excluye eliminados)
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsersByRole(UserRole role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = userRepository.findByRole(role, pageable);
        
        return mapToPagedResponse(userPage);
    }

    // BY ROLE - CON PAGINACIÓN (INCLUYENDO ELIMINADOS)
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsersByRoleIncludingDeleted(UserRole role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = userRepository.findByRoleIncludingDeleted(role, pageable);
        
        return mapToPagedResponse(userPage);
    }

    // BY STATUS - SIN PAGINACIÓN (excluye eliminados)
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByStatus(UserStatus status) {
        return userRepository.findByStatus(status).stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
    }

    // BY STATUS - SIN PAGINACIÓN (INCLUYENDO ELIMINADOS)
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByStatusIncludingDeleted(UserStatus status) {
        return userRepository.findByStatusIncludingDeleted(status).stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
    }

    // BY STATUS - CON PAGINACIÓN (excluye eliminados)
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsersByStatus(UserStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = userRepository.findByStatus(status, pageable);
        
        return mapToPagedResponse(userPage);
    }

    // BY STATUS - CON PAGINACIÓN (INCLUYENDO ELIMINADOS)
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsersByStatusIncludingDeleted(UserStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = userRepository.findByStatusIncludingDeleted(status, pageable);
        
        return mapToPagedResponse(userPage);
    }

    // ACTIVE USERS - SIN PAGINACIÓN (excluye eliminados)
    @Transactional(readOnly = true)
    public List<UserResponse> getActiveUsers() {
        return userRepository.findByActiveTrue().stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
    }

    // ACTIVE USERS - CON PAGINACIÓN (excluye eliminados)
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getActiveUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
        Page<User> userPage = userRepository.findByActiveTrue(pageable);
        
        return mapToPagedResponse(userPage);
    }

    // Método auxiliar para convertir Page a PagedResponse
    private PagedResponse<UserResponse> mapToPagedResponse(Page<User> userPage) {
        List<UserResponse> content = userPage.getContent().stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
        
        return new PagedResponse<>(
            content,
            userPage.getNumber(),
            userPage.getSize(),
            userPage.getTotalElements(),
            userPage.getTotalPages(),
            userPage.isFirst(),
            userPage.isLast(),
            userPage.isEmpty()
        );
    }

    @Transactional
    public UserResponse updateUser(UUID id, UserUpdateRequest request) {
        User user = userRepository.findByIdIncludingDeleted(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // No permitir actualizar usuarios eliminados
        if (user.getDeletedAt() != null) {
            throw new RuntimeException("Cannot update a deleted user");
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmailIncludingDeleted(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
        }

        userMapper.updateEntity(user, request);
        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    @Transactional
    public void changePassword(UUID id, UserPasswordChangeRequest request) {
        User user = userRepository.findByIdIncludingDeleted(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // No permitir cambiar contraseña de usuarios eliminados
        if (user.getDeletedAt() != null) {
            throw new RuntimeException("Cannot change password for a deleted user");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void activateUser(UUID id) {
        User user = userRepository.findByIdIncludingDeleted(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // No permitir activar usuarios eliminados
        if (user.getDeletedAt() != null) {
            throw new RuntimeException("Cannot activate a deleted user");
        }

        user.setActive(true);
        user.setStatus(UserStatus.active);
        userRepository.save(user);
    }

    @Transactional
    public void deactivateUser(UUID id) {
        User user = userRepository.findByIdIncludingDeleted(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // No permitir desactivar usuarios eliminados
        if (user.getDeletedAt() != null) {
            throw new RuntimeException("Cannot deactivate a deleted user");
        }

        user.setActive(false);
        user.setStatus(UserStatus.inactive);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findByIdIncludingDeleted(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Solo eliminar si no está ya eliminado
        if (user.getDeletedAt() == null) {
            userRepository.delete(user); // Esto ejecutará el soft delete
        }
    }

    @Transactional
    public void restoreUser(UUID id) {
        User user = userRepository.findByIdIncludingDeleted(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Solo restaurar si está eliminado
        if (user.getDeletedAt() != null) {
            user.setDeletedAt(null);
            userRepository.save(user);
        }
    }

    @Transactional
    public void hardDeleteUser(UUID id) {
        if (!userRepository.existsByIdIncludingDeleted(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.hardDeleteById(id);
    }

    @Transactional(readOnly = true)
    public long countUsersByRole(UserRole role) {
        return userRepository.countByRole(role);
    }

    @Transactional(readOnly = true)
    public long countUsersByStatus(UserStatus status) {
        return userRepository.countByStatus(status);
    }

    @Transactional(readOnly = true)
    public long countUsersByRoleIncludingDeleted(UserRole role) {
        return userRepository.countByRoleIncludingDeleted(role);
    }

    @Transactional(readOnly = true)
    public long countUsersByStatusIncludingDeleted(UserStatus status) {
        return userRepository.countByStatusIncludingDeleted(status);
    }

    @Transactional(readOnly = true)
    public long countDeletedUsers() {
        return userRepository.countDeletedUsers();
    }

    @Transactional(readOnly = true)
    public long countActiveUsers() {
        return userRepository.countActiveUsers();
    }
}