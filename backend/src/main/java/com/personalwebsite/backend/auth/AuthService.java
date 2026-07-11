package com.personalwebsite.backend.auth;

import com.personalwebsite.backend.common.BusinessException;
import com.personalwebsite.backend.config.JwtProperties;
import com.personalwebsite.backend.user.SysUser;
import com.personalwebsite.backend.user.SysUserMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final SysUserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public AuthService(
            SysUserMapper userMapper,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JwtProperties jwtProperties
    ) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    public LoginResponse login(LoginRequest request) {
        SysUser user = userMapper.findByUsername(request.username());
        if (user == null || !Boolean.TRUE.equals(user.getEnabled())
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            // 不区分账号与密码错误，避免泄露账户是否存在。
            throw new BusinessException("UNAUTHORIZED", "用户名或密码错误", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(new JwtService.SysUserIdentity(
                user.getId(),
                user.getUsername(),
                user.getRole()
        ));
        return new LoginResponse(token, "Bearer", jwtProperties.expiration().toSeconds());
    }

    public CurrentUserResponse currentUser(UserPrincipal principal) {
        return new CurrentUserResponse(principal.id(), principal.username(), principal.role());
    }
}

