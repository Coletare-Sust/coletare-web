package com.coletare.backend.shared.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties({SecurityProperties.class, KeycloakProperties.class})
public class AppConfig {

    @Bean
    RestClient restClient(RestClient.Builder builder) {
        return builder.build();
    }
}
