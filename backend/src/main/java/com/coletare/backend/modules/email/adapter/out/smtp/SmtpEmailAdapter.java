package com.coletare.backend.modules.email.adapter.out.smtp;

import com.coletare.backend.modules.email.application.port.in.EmailUseCase;
import com.coletare.backend.modules.email.domain.EmailMessage;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class SmtpEmailAdapter implements EmailUseCase {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    public SmtpEmailAdapter(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void send(EmailMessage message) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom("Coletare <" + from + ">");
            helper.setTo(message.to());
            helper.setReplyTo(from);
            helper.setSubject(message.subject());
            helper.setText(message.htmlBody(), true);
            mailSender.send(mime);
        } catch (MessagingException e) {
            throw new RuntimeException("Falha ao enviar email: " + e.getMessage(), e);
        }
    }
}
