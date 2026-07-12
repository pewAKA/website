package com.personalwebsite.backend.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 已登录管理员修改密码时提交的凭据；确认密码只在前端用于避免输入错误。 */
public record ChangePasswordRequest(
        @NotBlank(message = "请输入当前密码") String currentPassword,
        @NotBlank(message = "请输入新密码")
        @Size(min = 12, max = 72, message = "新密码长度需为 12 到 72 位") String newPassword
) {
}
