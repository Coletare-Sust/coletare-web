package com.coletare.backend.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "coletare.security")
public record SecurityProperties(
        String sessionCookieName,
        boolean sessionCookieSecure,
        long sessionCookieMaxAgeSeconds
) {
}
