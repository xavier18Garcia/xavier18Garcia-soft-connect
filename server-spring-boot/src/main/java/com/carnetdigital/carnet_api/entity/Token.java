package com.carnetdigital.carnet_api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "tokens",
    indexes = {
        @Index(name = "idx_token_unique", columnList = "token"),
        @Index(name = "idx_active_tokens", columnList = "used"),
        @Index(name = "idx_user_tokens", columnList = "user_fk"),
        @Index(name = "idx_token_expiration", columnList = "expiresAt")
    }
)
@SQLDelete(sql = "UPDATE tokens SET deletedAt = NOW() WHERE id = ?")
@SQLRestriction("deletedAt IS NULL")
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
    @JoinColumn(name = "user_fk", nullable = false, foreignKey = @ForeignKey(name = "fk_token_user"))
    private User user;

    @NotNull(message = "Expiration date is required")
    @Future(message = "Expiration date must be in the future")
    @Column(name = "expiresAt", nullable = false)
    private LocalDateTime expiresAt;

    @NotNull(message = "Token type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "token_type", nullable = false)
    private TokenType tokenType;

    @CreationTimestamp
    @Column(name = "createdAt", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updatedAt")
    private LocalDateTime updatedAt;

    @Column(name = "deletedAt")
    private LocalDateTime deletedAt;

    // Hook para configurar expiresAt automáticamente
    @PrePersist
    public void prePersist() {
        if (this.expiresAt == null && this.tokenType != null) {
            LocalDateTime now = LocalDateTime.now();
            switch (this.tokenType) {
                case ACCESS:
                    this.expiresAt = now.plusDays(1);
                    break;
                case REFRESH:
                    this.expiresAt = now.plusDays(7);
                    break;
                case RESET:
                    this.expiresAt = now.plusHours(24);
                    break;
                case VERIFICATION:
                    this.expiresAt = now.plusHours(48);
                    break;
            }
        }
    }

    // Métodos de utilidad
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public boolean isValid() {
        return !this.used && !isExpired();
    }

    public enum TokenType {
        ACCESS, REFRESH, RESET, VERIFICATION
    }
}
