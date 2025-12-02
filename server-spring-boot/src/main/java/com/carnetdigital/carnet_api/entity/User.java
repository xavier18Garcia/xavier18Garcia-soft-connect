package com.carnetdigital.carnet_api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_email", columnList = "email", unique = true),
        @Index(name = "idx_role", columnList = "role"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_active", columnList = "active")
    }
)
@SQLDelete(sql = "UPDATE users SET \"deletedAt\" = NOW() WHERE id = ?")
@SQLRestriction("\"deletedAt\" IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Size(max = 42)
    @Column(name = "first_name", length = 42)
    private String firstName;

    @Size(max = 42)
    @Column(name = "last_name", length = 42)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100)
    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(max = 60)
    @Column(name = "password", length = 60, nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role = UserRole.student;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status = UserStatus.pending;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "\"createdAt\"")
    private LocalDateTime createdAt;
  
@Column(name = "\"updatedAt\"")
private LocalDateTime updatedAt;

@Column(name = "\"deletedAt\"")
private LocalDateTime deletedAt;

    // Relación con Token
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Token> tokens = new ArrayList<>();

    // Enums
    public enum UserRole {
        admin, student
    }

    public enum UserStatus {
        active, inactive, pending
    }
}