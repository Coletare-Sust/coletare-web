package com.coletare.backend.modules.coleta.application.service;

import com.coletare.backend.modules.coleta.application.dto.DashboardData;
import com.coletare.backend.modules.coleta.application.port.in.ColetaUseCase;
import com.coletare.backend.modules.coleta.application.port.out.ColetaRepositoryPort;
import com.coletare.backend.modules.coleta.domain.Coleta;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ColetaService implements ColetaUseCase {

    private final ColetaRepositoryPort repository;

    public ColetaService(ColetaRepositoryPort repository) {
        this.repository = repository;
    }

    @Override
    public Coleta create(Coleta coleta) {
        Instant now = Instant.now();
        return repository.save(new Coleta(
                isBlank(coleta.id()) ? UUID.randomUUID().toString() : coleta.id(),
                coleta.cityId(), coleta.routeId(), coleta.vehicleName(), coleta.carPlate(),
                coleta.employeeId(), coleta.mass(), coleta.consume(), coleta.emission(),
                coleta.cost(), coleta.kmRun(),
                coleta.withdrawalRequestsIds() == null ? List.of() : coleta.withdrawalRequestsIds(),
                coleta.duration(), coleta.vehicleLatitude(), coleta.vehicleLongitude(),
                coleta.hasEnded(), now, now
        ));
    }

    @Override
    public Coleta update(String id, Coleta coleta) {
        Coleta existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coleta não encontrada: " + id));
        return repository.save(new Coleta(
                existing.id(), coleta.cityId(), coleta.routeId(),
                coleta.vehicleName(), coleta.carPlate(), coleta.employeeId(),
                coleta.mass(), coleta.consume(), coleta.emission(), coleta.cost(),
                coleta.kmRun(), coleta.withdrawalRequestsIds(), coleta.duration(),
                coleta.vehicleLatitude(), coleta.vehicleLongitude(), coleta.hasEnded(),
                existing.createdAt(), Instant.now()
        ));
    }

    @Override
    public Optional<Coleta> findById(String id) {
        return repository.findById(id);
    }

    @Override
    public List<Coleta> listAll() {
        return repository.findAll();
    }

    @Override
    public List<Coleta> listByCityId(String cityId) {
        return repository.findByCityId(cityId);
    }

    @Override
    public List<Coleta> listByRouteId(String routeId) {
        return repository.findByRouteId(routeId);
    }

    @Override
    public List<Coleta> listActiveByCityId(String cityId) {
        return repository.findByCityIdAndHasEndedFalse(cityId);
    }

    @Override
    public void delete(String id) {
        repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coleta não encontrada: " + id));
        repository.deleteById(id);
    }

    @Override
    public DashboardData getDashboardData(String cityId, String routeId) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        int currentMonthIdx = today.getMonthValue() - 1; // 0-based
        int monthDays = today.lengthOfMonth();
        Instant twelveMonthsAgo = today.minusMonths(12).atStartOfDay(ZoneOffset.UTC).toInstant();

        double[] landfillYear = new double[12];
        double[] fuelYear = new double[12];
        double[] emissionYear = new double[12];
        double[] massYear = new double[12];
        double[] landfillMonth = new double[monthDays];
        double[] fuelMonth = new double[monthDays];
        double[] emissionMonth = new double[monthDays];
        double[] massMonth = new double[monthDays];

        List<Coleta> collects = !isBlank(routeId)
                ? repository.findByRouteId(routeId).stream()
                    .filter(c -> cityId.equals(c.cityId())).toList()
                : repository.findByCityId(cityId);

        for (Coleta c : collects) {
            if (c.createdAt() == null || c.createdAt().isBefore(twelveMonthsAgo)) continue;

            LocalDate date = c.createdAt().atZone(ZoneOffset.UTC).toLocalDate();
            int mIdx = date.getMonthValue() - 1;
            int dIdx = date.getDayOfMonth() - 1;
            boolean isCurrentMonth = date.getYear() == today.getYear()
                    && date.getMonthValue() == today.getMonthValue();

            double landfill = (c.mass() != null && c.cost() != null && c.cost().landfillDelivery() != null)
                    ? round2(c.mass() * c.cost().landfillDelivery()) : 0;
            double emission = (c.consume() != null && c.kmRun() != null && c.emission() != null)
                    ? round2(c.consume() * c.kmRun() * c.emission()) : 0;
            double fuel = (c.cost() != null && c.cost().fuel() != null && c.consume() != null && c.kmRun() != null)
                    ? round2(c.consume() * c.kmRun() * c.cost().fuel()) : 0;
            double mass = c.mass() != null ? round2(c.mass()) : 0;

            landfillYear[mIdx] += landfill;
            fuelYear[mIdx] += fuel;
            emissionYear[mIdx] += emission;
            massYear[mIdx] += mass;

            if (isCurrentMonth && dIdx < monthDays) {
                landfillMonth[dIdx] += landfill;
                fuelMonth[dIdx] += fuel;
                emissionMonth[dIdx] += emission;
                massMonth[dIdx] += mass;
            }
        }

        List<Double> landfillYearList = rotateYear(landfillYear, currentMonthIdx);
        List<Double> fuelYearList = rotateYear(fuelYear, currentMonthIdx);
        List<Double> emissionYearList = rotateYear(emissionYear, currentMonthIdx);
        List<Double> massYearList = rotateYear(massYear, currentMonthIdx);

        return new DashboardData(
                new DashboardData.MetricData(landfillYearList, last6(landfillYearList), toList(landfillMonth)),
                new DashboardData.MetricData(fuelYearList, last6(fuelYearList), toList(fuelMonth)),
                new DashboardData.MetricData(emissionYearList, last6(emissionYearList), toList(emissionMonth)),
                new DashboardData.MetricData(massYearList, last6(massYearList), toList(massMonth))
        );
    }

    private List<Double> rotateYear(double[] arr, int currentMonthIdx) {
        List<Double> result = new ArrayList<>();
        for (int i = currentMonthIdx + 1; i < 12; i++) result.add(arr[i]);
        for (int i = 0; i <= currentMonthIdx; i++) result.add(arr[i]);
        return result;
    }

    private List<Double> last6(List<Double> year) {
        return year.subList(Math.max(0, year.size() - 6), year.size());
    }

    private List<Double> toList(double[] arr) {
        List<Double> result = new ArrayList<>();
        for (double v : arr) result.add(v);
        return result;
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private boolean isBlank(String v) {
        return v == null || v.isBlank();
    }
}
