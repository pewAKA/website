package com.personalwebsite.backend.auth;

import com.personalwebsite.backend.user.SysUser;
import com.personalwebsite.backend.user.SysUserMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtAuthenticationFilterTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void acceptsTokenThatMatchesCurrentAccountVersion() throws Exception {
        JwtService jwtService = mock(JwtService.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        UserPrincipal principal = new UserPrincipal(1L, "admin", "ADMIN", 2L);
        when(jwtService.parseToken("current-token")).thenReturn(principal);
        when(userMapper.findById(1L)).thenReturn(user(2L));

        new JwtAuthenticationFilter(jwtService, userMapper).doFilter(
                request("current-token"), new MockHttpServletResponse(), new MockFilterChain()
        );

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
    }

    @Test
    void rejectsTokenWhoseVersionWasInvalidatedByPasswordChange() throws Exception {
        JwtService jwtService = mock(JwtService.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        when(jwtService.parseToken("old-token")).thenReturn(new UserPrincipal(1L, "admin", "ADMIN", 1L));
        when(userMapper.findById(1L)).thenReturn(user(2L));

        new JwtAuthenticationFilter(jwtService, userMapper).doFilter(
                request("old-token"), new MockHttpServletResponse(), new MockFilterChain()
        );

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    private MockHttpServletRequest request(String token) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        return request;
    }

    private SysUser user(long tokenVersion) {
        SysUser user = new SysUser();
        user.setId(1L);
        user.setUsername("admin");
        user.setRole("ADMIN");
        user.setEnabled(true);
        user.setTokenVersion(tokenVersion);
        return user;
    }
}
