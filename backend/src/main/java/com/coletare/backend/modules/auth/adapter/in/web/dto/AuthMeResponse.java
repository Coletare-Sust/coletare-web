package com.coletare.backend.modules.auth.adapter.in.web.dto;

import java.util.List;

public record AuthMeResponse(
        String userId,
        String email,
        List<String> roles,
        boolean authenticated
) {
}
