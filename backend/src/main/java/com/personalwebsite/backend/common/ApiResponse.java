package com.personalwebsite.backend.common;

/**
 * 所有业务接口共用的响应结构，便于前端统一处理成功与错误状态。
 */
public record ApiResponse<T>(String code, String message, T data) {

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("OK", "操作成功", data);
    }

    public static <T> ApiResponse<T> failure(String code, String message) {
        return new ApiResponse<>(code, message, null);
    }
}

