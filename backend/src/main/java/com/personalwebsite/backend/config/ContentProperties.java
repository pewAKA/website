package com.personalwebsite.backend.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** 文章媒体与公开站点地址均由部署环境提供，避免写死域名和磁盘路径。 */
@Validated
@ConfigurationProperties(prefix = "app.content")
public record ContentProperties(
        @NotBlank String mediaRoot,
        @NotBlank String mediaPublicPath,
        @NotBlank String siteUrl
) {
}
