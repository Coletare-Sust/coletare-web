package com.coletare.backend.modules.auth.adapter.out.keycloak;

import com.coletare.backend.modules.auth.application.port.out.IdentityProviderPort;
import com.coletare.backend.modules.auth.domain.AuthTokens;
import com.coletare.backend.shared.config.KeycloakProperties;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Component
public class KeycloakIdentityProviderAdapter implements IdentityProviderPort {

    private final RestClient restClient;
    private final KeycloakProperties keycloak;

    public KeycloakIdentityProviderAdapter(RestClient restClient, KeycloakProperties keycloak) {
        this.restClient = restClient;
        this.keycloak = keycloak;
    }

    @Override
    public AuthTokens loginWithPassword(String email, String password) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "password");
        body.add("client_id", keycloak.clientId());
        body.add("client_secret", keycloak.clientSecret());
        body.add("username", email);
        body.add("password", password);

        JsonNode token = requestToken(body);
        return toAuthTokens(token);
    }

    @Override
    public AuthTokens refresh(String refreshToken) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "refresh_token");
        body.add("client_id", keycloak.clientId());
        body.add("client_secret", keycloak.clientSecret());
        body.add("refresh_token", refreshToken);

        JsonNode token = requestToken(body);
        return toAuthTokens(token);
    }

    @Override
    public void logout(String refreshToken) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", keycloak.clientId());
        body.add("client_secret", keycloak.clientSecret());
        body.add("refresh_token", refreshToken);

        restClient.post()
                .uri(keycloak.baseUrl() + "/realms/" + keycloak.realm() + "/protocol/openid-connect/logout")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }

    private JsonNode requestToken(MultiValueMap<String, String> body) {
        return restClient.post()
                .uri(keycloak.baseUrl() + "/realms/" + keycloak.realm() + "/protocol/openid-connect/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    private AuthTokens toAuthTokens(JsonNode token) {
        String accessToken = token.path("access_token").asText();
        String refreshToken = token.path("refresh_token").asText();
        long expiresIn = token.path("expires_in").asLong();
        String tokenType = token.path("token_type").asText("Bearer");

        String subject = "";
        String email = "";
        List<String> roles = new ArrayList<>();

        String[] chunks = accessToken.split("\\.");
        if (chunks.length >= 2) {
            String payload = new String(Base64.getUrlDecoder().decode(chunks[1]));
            try {
                JsonNode payloadJson = new com.fasterxml.jackson.databind.ObjectMapper().readTree(payload);
                subject = payloadJson.path("sub").asText();
                email = payloadJson.path("email").asText();
                JsonNode realmAccess = payloadJson.path("realm_access").path("roles");
                if (realmAccess.isArray()) {
                    realmAccess.forEach(node -> roles.add(node.asText()));
                }
            } catch (Exception ignored) {
                // fallback to empty claims
            }
        }

        return new AuthTokens(accessToken, refreshToken, expiresIn, tokenType, subject, email, roles, Instant.now());
    }
}
