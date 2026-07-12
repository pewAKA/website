package com.personalwebsite.backend.auth;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import com.personalwebsite.backend.user.SysUser;
import com.personalwebsite.backend.user.SysUserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger LOGGER = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;
    private final SysUserMapper userMapper;

    public JwtAuthenticationFilter(JwtService jwtService, SysUserMapper userMapper) {
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            try {
                UserPrincipal principal = jwtService.parseToken(authorization.substring(7));
                SysUser user = userMapper.findById(principal.id());
                if (!matchesCurrentAccount(user, principal)) {
                    LOGGER.debug("收到已失效或已被撤销的 JWT，用户 ID: {}", principal.id());
                    filterChain.doFilter(request, response);
                    return;
                }
                var authentication = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + principal.role()))
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtException | IllegalArgumentException exception) {
                // 令牌无效时继续处理，由 Spring Security 对受保护资源返回 401。
                LOGGER.debug("收到无效 JWT: {}", exception.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }

    private boolean matchesCurrentAccount(SysUser user, UserPrincipal principal) {
        return user != null
                && Boolean.TRUE.equals(user.getEnabled())
                && principal.username().equals(user.getUsername())
                && principal.role().equals(user.getRole())
                && principal.tokenVersion().equals(user.getTokenVersion());
    }
}
