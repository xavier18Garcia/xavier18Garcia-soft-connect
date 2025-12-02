package com.carnetdigital.carnet_api.repository;

import com.carnetdigital.carnet_api.entity.User;
import com.carnetdigital.carnet_api.entity.User.UserRole;
import com.carnetdigital.carnet_api.entity.User.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    // Buscar por email
    Optional<User> findByEmail(String email);
    
    // Verificar si existe un email
    boolean existsByEmail(String email);
    
    // Buscar por rol
    List<User> findByRole(UserRole role);
    
    // Buscar por estado
    List<User> findByStatus(UserStatus status);
    
    // Buscar usuarios activos
    List<User> findByActiveTrue();
    
    // Buscar usuarios inactivos
    List<User> findByActiveFalse();
    
    // Buscar por rol y estado
    List<User> findByRoleAndStatus(UserRole role, UserStatus status);
    
    // Buscar por nombre (firstName o lastName)
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> searchByName(@Param("name") String name);
    
    // Contar usuarios por rol
    long countByRole(UserRole role);
    
    // Contar usuarios por estado
    long countByStatus(UserStatus status);
}