package com.carnetdigital.carnet_api.repository;

import com.carnetdigital.carnet_api.entity.User;
import com.carnetdigital.carnet_api.entity.User.UserRole;
import com.carnetdigital.carnet_api.entity.User.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    // ==================== BASIC QUERIES (excluyen eliminados automáticamente) ====================
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // ==================== CON PAGINACIÓN ====================
    Page<User> findByRole(UserRole role, Pageable pageable);
    Page<User> findByStatus(UserStatus status, Pageable pageable);
    Page<User> findByActiveTrue(Pageable pageable);
    Page<User> findByActiveFalse(Pageable pageable);
    Page<User> findByRoleAndStatus(UserRole role, UserStatus status, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<User> searchByName(@Param("search") String search, Pageable pageable);
    
    // ==================== SIN PAGINACIÓN ====================
    List<User> findByRole(UserRole role);
    List<User> findByStatus(UserStatus status);
    List<User> findByActiveTrue();
    List<User> findByActiveFalse();
    List<User> findByRoleAndStatus(UserRole role, UserStatus status);
    
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> searchByName(@Param("name") String name);
    
    // ==================== QUERIES QUE INCLUYEN ELIMINADOS ====================
    
    // Obtener por ID incluyendo eliminados
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdIncludingDeleted(@Param("id") UUID id);
    
    // Obtener todos los usuarios incluyendo eliminados
    @Query("SELECT u FROM User u")
    List<User> findAllIncludingDeleted();
    
    @Query("SELECT u FROM User u")
    Page<User> findAllIncludingDeleted(Pageable pageable);
    
    // Buscar por email incluyendo eliminados
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailIncludingDeleted(@Param("email") String email);
    
    // Verificar si email existe incluyendo eliminados
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email")
    boolean existsByEmailIncludingDeleted(@Param("email") String email);
    
    // Buscar por rol incluyendo eliminados
    @Query("SELECT u FROM User u WHERE u.role = :role")
    List<User> findByRoleIncludingDeleted(@Param("role") UserRole role);
    
    @Query("SELECT u FROM User u WHERE u.role = :role")
    Page<User> findByRoleIncludingDeleted(@Param("role") UserRole role, Pageable pageable);
    
    // Buscar por estado incluyendo eliminados
    @Query("SELECT u FROM User u WHERE u.status = :status")
    List<User> findByStatusIncludingDeleted(@Param("status") UserStatus status);
    
    @Query("SELECT u FROM User u WHERE u.status = :status")
    Page<User> findByStatusIncludingDeleted(@Param("status") UserStatus status, Pageable pageable);
    
    // Buscar solo usuarios eliminados
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NOT NULL")
    List<User> findDeletedUsers();
    
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NOT NULL")
    Page<User> findDeletedUsers(Pageable pageable);
    
    // Buscar solo usuarios no eliminados (explícito)
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    List<User> findActiveUsers();
    
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    Page<User> findActiveUsers(Pageable pageable);
    
    // Búsqueda por nombre incluyendo eliminados
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%')))")
    List<User> searchByNameIncludingDeleted(@Param("name") String name);
    
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchByNameIncludingDeleted(@Param("search") String search, Pageable pageable);
    
    // Usuarios activos por estado incluyendo eliminados
    @Query("SELECT u FROM User u WHERE u.active = true")
    List<User> findByActiveTrueIncludingDeleted();
    
    @Query("SELECT u FROM User u WHERE u.active = true")
    Page<User> findByActiveTrueIncludingDeleted(Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.active = false")
    List<User> findByActiveFalseIncludingDeleted();
    
    @Query("SELECT u FROM User u WHERE u.active = false")
    Page<User> findByActiveFalseIncludingDeleted(Pageable pageable);
    
    // ==================== RESTAURAR USUARIO ====================
    @Modifying
    @Query("UPDATE User u SET u.deletedAt = null WHERE u.id = :id")
    void restoreUser(@Param("id") UUID id);
    
    // ==================== STATISTICS ====================
    long countByRole(UserRole role);
    long countByStatus(UserStatus status);
    
    // Estadísticas incluyendo eliminados
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRoleIncludingDeleted(@Param("role") UserRole role);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    long countByStatusIncludingDeleted(@Param("status") UserStatus status);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NOT NULL")
    long countDeletedUsers();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NULL")
    long countActiveUsers();
    
    // ==================== HARD DELETE ====================
    @Modifying
    @Query(value = "DELETE FROM users WHERE id = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") UUID id);
    
    @Query(value = "SELECT COUNT(*) > 0 FROM users WHERE id = :id", nativeQuery = true)
    boolean existsByIdIncludingDeleted(@Param("id") UUID id);
}