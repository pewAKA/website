package com.personalwebsite.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.personalwebsite.backend.config.JwtProperties;
import java.time.Duration;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    @Test
    void shouldGenerateAndParseToken() {
        JwtProperties properties = new JwtProperties(
                "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
                Duration.ofHours(1)
        );
        JwtService service = new JwtService(properties);

        String token = service.generateToken(new JwtService.SysUserIdentity(1L, "admin", "ADMIN"));
        UserPrincipal principal = service.parseToken(token);

        assertEquals(1L, principal.id());
        assertEquals("admin", principal.username());
        assertEquals("ADMIN", principal.role());
    }
}
