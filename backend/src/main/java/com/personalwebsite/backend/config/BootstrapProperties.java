package com.personalwebsite.backend.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.bootstrap")
public record BootstrapProperties(
        @NotBlank String adminUsername,
        String adminPassword
) {
}

