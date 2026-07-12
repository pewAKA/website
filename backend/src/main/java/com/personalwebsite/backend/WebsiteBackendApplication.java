package com.personalwebsite.backend;

import com.personalwebsite.backend.config.BootstrapProperties;
import com.personalwebsite.backend.config.ContentProperties;
import com.personalwebsite.backend.config.CorsProperties;
import com.personalwebsite.backend.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class, BootstrapProperties.class, ContentProperties.class})
public class WebsiteBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebsiteBackendApplication.class, args);
    }
}
