package com.personalwebsite.backend.auth;

public record LoginResponse(String token, String tokenType, long expiresInSeconds) {
}

