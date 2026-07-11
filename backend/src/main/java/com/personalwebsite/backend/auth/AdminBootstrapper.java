package com.personalwebsite.backend.auth;

import com.personalwebsite.backend.config.BootstrapProperties;
import com.personalwebsite.backend.user.SysUser;
import com.personalwebsite.backend.user.SysUserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AdminBootstrapper implements ApplicationRunner {
    private static final Logger LOGGER = LoggerFactory.getLogger(AdminBootstrapper.class);
    private final BootstrapProperties properties;
    private final SysUserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrapper(
            BootstrapProperties properties,
            SysUserMapper userMapper,
            PasswordEncoder passwordEncoder
    ) {
        this.properties = properties;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(properties.adminPassword())
                || userMapper.findByUsername(properties.adminUsername()) != null) {
            return;
        }

        SysUser admin = new SysUser();
        admin.setUsername(properties.adminUsername());
        admin.setPasswordHash(passwordEncoder.encode(properties.adminPassword()));
        admin.setRole("ADMIN");
        admin.setEnabled(true);
        userMapper.insert(admin);
        // 不输出密码，仅提示部署脚本可清除一次性环境变量。
        LOGGER.info("已创建初始管理员账户 {}，请清除 APP_BOOTSTRAP_ADMIN_PASSWORD 后重启服务", admin.getUsername());
    }
}

