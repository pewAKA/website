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
                user.getRole(),
                user.getTokenVersion()
        ));
        return new LoginResponse(token, "Bearer", jwtProperties.expiration().toSeconds());
    }

    public CurrentUserResponse currentUser(UserPrincipal principal) {
        return new CurrentUserResponse(principal.id(), principal.username(), principal.role());
    }

    public void changePassword(UserPrincipal principal, ChangePasswordRequest request) {
        if (request.newPassword().length() < 12 || request.newPassword().length() > 72) {
            throw new BusinessException("VALIDATION_ERROR", "新密码长度需为 12 到 72 位", HttpStatus.BAD_REQUEST);
        }
        SysUser user = userMapper.findById(principal.id());
        if (user == null || !Boolean.TRUE.equals(user.getEnabled())
                || !passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException("UNAUTHORIZED", "当前密码错误", HttpStatus.UNAUTHORIZED);
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BusinessException("VALIDATION_ERROR", "新密码不能与当前密码相同", HttpStatus.BAD_REQUEST);
        }
        if (userMapper.updatePasswordAndIncrementTokenVersion(user.getId(), passwordEncoder.encode(request.newPassword())) != 1) {
            throw new BusinessException("UNAUTHORIZED", "账号状态已变化，请重新登录", HttpStatus.UNAUTHORIZED);
        }
    }
}
