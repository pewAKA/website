package com.personalwebsite.backend.common;

import org.springframework.http.HttpStatus;

/**
 * 用于将可预期的业务错误映射为统一 HTTP 响应。
 */
public class BusinessException extends RuntimeException {
    private final String code;
    private final HttpStatus status;

    public BusinessException(String code, String message, HttpStatus status) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public String getCode() {
        return code;
    }

    public HttpStatus getStatus() {
        return status;
    }
}

