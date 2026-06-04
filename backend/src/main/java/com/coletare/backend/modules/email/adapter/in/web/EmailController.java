package com.coletare.backend.modules.email.adapter.in.web;

import com.coletare.backend.modules.email.application.port.in.EmailUseCase;
import com.coletare.backend.modules.email.domain.EmailMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/bff/email")
public class EmailController {

    private final EmailUseCase emailUseCase;

    public EmailController(EmailUseCase emailUseCase) {
        this.emailUseCase = emailUseCase;
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> send(@RequestBody EmailRequest request) {
        try {
            emailUseCase.send(new EmailMessage(request.email(), request.subject(), request.html()));
            return ResponseEntity.ok(Map.of("error", (Object) null));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("error", "Não foi possível enviar o email"));
        }
    }

    public record EmailRequest(String email, String subject, String html) {}
}
