package com.coletare.backend.modules.user.adapter.in.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.Map;

public record UpsertUserRequest(
        String id,
        String externalId,
        @Email @NotBlank String email,
        @NotBlank String displayName,
        String cityId,
        List<String> roles,
        Map<String, Object> metadata
) {
}
