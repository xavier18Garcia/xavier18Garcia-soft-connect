package com.carnetdigital.carnet_api.repository;

import com.carnetdigital.carnet_api.entity.Token;
import com.carnetdigital.carnet_api.entity.Token.TokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TokenRepository extends JpaRepository<Token, UUID> {
    
    // Buscar token por valor
    Optional<Token> findByToken(String token);
    
    // Buscar tokens no usados de un usuario
    List<Token> findByUserIdAndUsedFalse(UUID userId);
    
    // Buscar tokens válidos (no usados y no expirados)
    @Query("SELECT t FROM Token t WHERE t.used = false AND t.expiresAt > :now")
    List<Token> findActiveTokens(@Param("now") LocalDateTime now);
    
    // Buscar tokens válidos de un usuario por tipo
    @Query("SELECT t FROM Token t WHERE t.user.id = :userId " +
           "AND t.tokenType = :tokenType " +
           "AND t.used = false " +
           "AND t.expiresAt > :now")
    List<Token> findValidTokensByUserAndType(
        @Param("userId") UUID userId, 
        @Param("tokenType") TokenType tokenType,
        @Param("now") LocalDateTime now
    );
    
    // Buscar todos los tokens de un usuario
    List<Token> findByUserId(UUID userId);
    
    // Buscar tokens por tipo
    List<Token> findByTokenType(TokenType tokenType);
    
    // Buscar tokens expirados
    @Query("SELECT t FROM Token t WHERE t.expiresAt < :now")
    List<Token> findExpiredTokens(@Param("now") LocalDateTime now);
    
    // Eliminar tokens expirados (hard delete)
    @Transactional
    @Modifying
    @Query("DELETE FROM Token t WHERE t.expiresAt < :date")
    int deleteExpiredTokens(@Param("date") LocalDateTime date);
    
    // Marcar token como usado
    @Transactional
    @Modifying
    @Query("UPDATE Token t SET t.used = true WHERE t.id = :tokenId")
    int markTokenAsUsed(@Param("tokenId") UUID tokenId);
    
    // Invalidar todos los tokens de un usuario
    @Transactional
    @Modifying
    @Query("UPDATE Token t SET t.used = true WHERE t.user.id = :userId")
    int invalidateAllUserTokens(@Param("userId") UUID userId);
    
    // Invalidar tokens de un usuario por tipo
    @Transactional
    @Modifying
    @Query("UPDATE Token t SET t.used = true WHERE t.user.id = :userId AND t.tokenType = :tokenType")
    int invalidateUserTokensByType(@Param("userId") UUID userId, @Param("tokenType") TokenType tokenType);
    
    // Verificar si existe un token válido
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Token t " +
           "WHERE t.token = :token AND t.used = false AND t.expiresAt > :now")
    boolean existsValidToken(@Param("token") String token, @Param("now") LocalDateTime now);
}
