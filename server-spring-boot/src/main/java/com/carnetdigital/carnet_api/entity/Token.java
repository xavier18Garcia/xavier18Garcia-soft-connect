package com.carnetdigital.carnet_api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "tokens",
    indexes = {
        @Index(name = "idx_token_unique", columnList = "token"),
        @Index(name = "idx_active_tokens", columnList = "used"),
        @Index(name = "idx_user_tokens", columnList = "user_fk"),
        @Index(name = "idx_token_expiration", columnList = "expires_at")
    }
)
@SQLDelete(sql = "UPDATE tokens SET \"deletedAt\" = NOW() WHERE id = ?")
@SQLRestriction("\"deletedAt\" IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "Token is required")
    @Column(name = "token", nullable = false, columnDefinition = "TEXT")
    private String token;

    @Column(name = "used", nullable = false)
    private Boolean used = false;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_fk", 
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_token_user")
    )
    private User user;

    @NotNull(message = "Expiration date is required")
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @NotNull(message = "Token type is required")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM) // ✅ Agregado para usar ENUM nativo
    @Column(name = "token_type", nullable = false)
    private TokenType tokenType;

    @Column(name = "\"createdAt\"", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"updatedAt\"")
    private LocalDateTime updatedAt;

    @Column(name = "\"deletedAt\"")
    private LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        
        if (this.expiresAt == null && this.tokenType != null) {
            switch (this.tokenType) {
                case access:
                    this.expiresAt = now.plusDays(1);
                    break;
                case refresh:
                    this.expiresAt = now.plusDays(7);
                    break;
                case reset:
                    this.expiresAt = now.plusHours(24);
                    break;
                case verification:
                    this.expiresAt = now.plusHours(48);
                    break;
            }
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public boolean isValid() {
        return !this.used && !isExpired() && this.deletedAt == null;
    }

    public void markAsUsed() {
        this.used = true;
    }

    public enum TokenType {
        access,
        refresh,
        reset,
        verification
    }
}