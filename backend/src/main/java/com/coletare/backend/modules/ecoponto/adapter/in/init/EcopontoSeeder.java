package com.coletare.backend.modules.ecoponto.adapter.in.init;

import com.coletare.backend.modules.ecoponto.application.port.in.EcopontoUseCase;
import com.coletare.backend.modules.ecoponto.domain.Ecoponto;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Component
public class EcopontoSeeder implements CommandLineRunner {

    private final EcopontoUseCase ecopontoUseCase;

    public EcopontoSeeder(EcopontoUseCase ecopontoUseCase) {
        this.ecopontoUseCase = ecopontoUseCase;
    }

    @Override
    public void run(String... args) throws Exception {
        if (ecopontoUseCase.listAll().isEmpty()) {
            seedEcopontos();
        }
    }

    private void seedEcopontos() {
        List<Ecoponto> ecopontos = Arrays.asList(
                new Ecoponto(
                "-Of269bXD-vAmcOnUQEM",
                        "5TWzDEnYsQM4HUVigcWajwbAm0g1",
                        Instant.parse("2025-11-27T02:20:26.984Z"),
                        "Belo Jardim, State of Pernambuco, Brazil",
                        true,
                        -8.340725915015284,
                        -36.41356488135587,
                        "Ecoponto de Recicláveis da Rua Pau Brasil",
                        Arrays.asList("Recicláveis"),
                        Instant.parse("2025-11-27T02:20:26.984Z")
                )
        );

        for (Ecoponto ecoponto : ecopontos) {
            ecopontoUseCase.create(ecoponto);
        }
    }
}
