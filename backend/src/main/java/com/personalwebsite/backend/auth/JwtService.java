package com.personalwebsite.backend.auth;

import com.personalwebsite.backend.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final JwtProperties properties;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
    }

    public String generateToken(SysUserIdentity identity) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(properties.expiration());
        return Jwts.builder()
                .subject(identity.username())
                .claim("uid", identity.id())
                .claim("role", identity.role())
                .claim("ver", identity.tokenVersion())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey())
                .compact();
    }

    public UserPrincipal parseToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        Number userId = claims.get("uid", Number.class);
        String role = claims.get("role", String.class);
        Number tokenVersion = claims.get("ver", Number.class);
        if (userId == null || role == null || tokenVersion == null) {
            throw new IllegalArgumentException("JWT 缺少必要的身份字段");
        }
        return new UserPrincipal(userId.longValue(), claims.getSubject(), role, tokenVersion.longValue());
    }

    private SecretKey signingKey() {
        byte[] keyBytes = Decoders.BASE64.decode(properties.secret());
        if (keyBytes.length < 32) {
            throw new IllegalStateException("APP_JWT_SECRET 必须是至少 32 字节的 Base64 密钥");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public record SysUserIdentity(Long id, String username, String role, Long tokenVersion) {
    }
}
