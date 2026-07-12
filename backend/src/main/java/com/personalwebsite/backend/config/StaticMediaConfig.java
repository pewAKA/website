package com.personalwebsite.backend.config;

import java.nio.file.Path;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 本地开发时由 Spring 直接提供上传文件；生产环境由 Nginx 提供相同目录。 */
@Configuration
public class StaticMediaConfig implements WebMvcConfigurer {
    private final ContentProperties contentProperties;

    public StaticMediaConfig(ContentProperties contentProperties) {
        this.contentProperties = contentProperties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String publicPath = contentProperties.mediaPublicPath().replaceAll("/+$", "");
        String resourceLocation = Path.of(contentProperties.mediaRoot()).toAbsolutePath().toUri().toString();
        if (!resourceLocation.endsWith("/")) {
            resourceLocation += "/";
        }
        registry.addResourceHandler(publicPath + "/**").addResourceLocations(resourceLocation);
    }
}
