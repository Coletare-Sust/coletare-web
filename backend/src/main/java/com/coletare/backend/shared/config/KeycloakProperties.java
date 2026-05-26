package com.coletare.backend.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "coletare.keycloak")
public record KeycloakProperties(
        String baseUrl,
        String realm,
        String clientId,
        String clientSecret,
        String adminClientId,
        String adminClientSecret
) {
}
