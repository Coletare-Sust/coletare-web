package com.coletare.backend.modules.coleta.application.dto;

import java.util.List;

public record DashboardData(
        MetricData landfill,
        MetricData fuel,
        MetricData emission,
        MetricData mass
) {
    public record MetricData(
            List<Double> year,
            List<Double> semester,
            List<Double> month
    ) {}
}
