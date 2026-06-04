package com.coletare.backend.modules.email.application.port.in;

import com.coletare.backend.modules.email.domain.EmailMessage;

public interface EmailUseCase {
    void send(EmailMessage message);
}
