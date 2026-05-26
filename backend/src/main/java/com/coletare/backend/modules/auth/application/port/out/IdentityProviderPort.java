package com.coletare.backend.modules.auth.application.port.out;

import com.coletare.backend.modules.auth.domain.AuthTokens;

public interface IdentityProviderPort {
    AuthTokens loginWithPassword(String email, String password);
    AuthTokens refresh(String refreshToken);
    void logout(String refreshToken);
}
