import { RoutePoint } from "@/utils/coordinates";

/** Instante (ms) de um `recordedAt` ISO-8601 vindo do backend, ou null se ausente/ilegível. */
export function parseRecordedAt(value: unknown): number | null {
  if (typeof value !== "string" || value.length === 0) return null;

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : null;
}

/**
 * Uma mensagem só atualiza o caminhão se o fix for posterior ao último aplicado. Fixes entregues em lote
 * pelo celular depois de um período em segundo plano chegam fora de ordem; aplicá-los em ordem de chegada
 * faz o caminhão "voltar" no mapa e embaralha o trajeto. Sem horário (backend antigo) a mensagem é aplicada.
 */
export function isNewerFix(
  lastRecordedAt: number | null | undefined,
  recordedAt: number | null
): boolean {
  if (recordedAt === null || lastRecordedAt == null) return true;

  return recordedAt > lastRecordedAt;
}

function samePoint(a: RoutePoint, b: RoutePoint) {
  return a.lat === b.lat && a.lng === b.lng;
}

/**
 * Trajeto percorrido depois de uma mensagem. O `routePath` do backend é o trajeto completo e já ordenado,
 * então vale como fonte da verdade, mas só se não for menor que o que já temos (uma lista menor significaria
 * perder pontos). Sem `routePath` (ou menor), acrescenta a posição atual, sem repetir o último ponto.
 */
export function nextRoutePath(
  previous: RoutePoint[],
  incoming: RoutePoint[],
  current: RoutePoint
): RoutePoint[] {
  if (incoming.length > 0 && incoming.length >= previous.length) {
    return incoming;
  }

  const base = previous.length > 0 ? previous : incoming;
  const last = base[base.length - 1];

  return last && samePoint(last, current) ? base : [...base, current];
}
