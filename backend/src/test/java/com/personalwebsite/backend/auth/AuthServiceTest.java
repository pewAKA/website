package com.personalwebsite.backend.auth;

import com.personalwebsite.backend.common.BusinessException;
import com.personalwebsite.backend.config.JwtProperties;
import com.personalwebsite.backend.user.SysUser;
import com.personalwebsite.backend.user.SysUserMapper;
import java.time.Duration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private SysUserMapper userMapper;

    @Mock
    private JwtService jwtService;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userMapper,
                passwordEncoder,
                jwtService,
                new JwtProperties("MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=", Duration.ofHours(12))
        );
    }

    @Test
    void changesPasswordAndInvalidatesExistingTokenVersion() {
        SysUser user = user("current-password", 4L);
        when(userMapper.findById(1L)).thenReturn(user);
        when(userMapper.updatePasswordAndIncrementTokenVersion(anyLong(), anyString())).thenReturn(1);

        authService.changePassword(
                new UserPrincipal(1L, "admin", "ADMIN", 4L),
                new ChangePasswordRequest("current-password", "new-secure-password")
        );

        ArgumentCaptor<String> hashCaptor = ArgumentCaptor.forClass(String.class);
        verify(userMapper).updatePasswordAndIncrementTokenVersion(org.mockito.ArgumentMatchers.eq(1L), hashCaptor.capture());
        assertThat(passwordEncoder.matches("new-secure-password", hashCaptor.getValue())).isTrue();
    }

    @Test
    void rejectsIncorrectCurrentPasswordWithoutChangingCredentials() {
        when(userMapper.findById(1L)).thenReturn(user("current-password", 0L));

        assertThatThrownBy(() -> authService.changePassword(
                new UserPrincipal(1L, "admin", "ADMIN", 0L),
                new ChangePasswordRequest("incorrect-password", "new-secure-password")
        )).isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getStatus().value()).isEqualTo(401));

        verify(userMapper, never()).updatePasswordAndIncrementTokenVersion(anyLong(), anyString());
    }

    @Test
    void rejectsTooShortOrReusedPassword() {
        assertThatThrownBy(() -> authService.changePassword(
                new UserPrincipal(1L, "admin", "ADMIN", 0L),
                new ChangePasswordRequest("current-password", "short")
        )).isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getStatus().value()).isEqualTo(400));

        when(userMapper.findById(1L)).thenReturn(user("current-password", 0L));
        assertThatThrownBy(() -> authService.changePassword(
                new UserPrincipal(1L, "admin", "ADMIN", 0L),
                new ChangePasswordRequest("current-password", "current-password")
        )).isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getStatus().value()).isEqualTo(400));
    }

    private SysUser user(String password, long tokenVersion) {
        SysUser user = new SysUser();
        user.setId(1L);
        user.setUsername("admin");
        user.setRole("ADMIN");
        user.setEnabled(true);
        user.setTokenVersion(tokenVersion);
        user.setPasswordHash(passwordEncoder.encode(password));
        return user;
    }
}
