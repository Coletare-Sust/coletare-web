package com.coletare.backend.modules.email.domain;

public record EmailMessage(String to, String subject, String htmlBody) {}
