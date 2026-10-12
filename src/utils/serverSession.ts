import "server-only";
import { NextResponse } from "next/server";
import { getApiUrl } from "@/config/api";

export type SessionUser = {
  id: string;
  role: string;
  cityId: string | null;
};

type SessionResult = { user: SessionUser } | { response: NextResponse };

const apiUrl = () => getApiUrl();

/** Credenciais do chamador (cookie do web ou Bearer do mobile), para repassar ao backend. */
export function forwardedAuthHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  const cookie = request.headers.get("cookie");
  const authorization = request.headers.get("authorization");
  if (cookie) headers.cookie = cookie;
  if (authorization) headers.authorization = authorization;
  return headers;
}

/**
 * As rotas /api do Next rodam no servidor e nao tem sessao propria: a identidade vem do
 * backend. Valida o cookie/Bearer do chamador em /auth/me; retorna null se invalido.
 */
export async function getSessionUser(
  request: Request
): Promise<SessionUser | null> {
  const headers = forwardedAuthHeaders(request);
  if (!headers.cookie && !headers.authorization) return null;

  try {
    const response = await fetch(`${apiUrl()}/auth/me`, {
      headers,
      cache: "no-store"
    });
    if (!response.ok) return null;

    const me = await response.json();
    return {
      id: me.id,
      role: me.role,
      // Para a prefeitura (ADMIN) o proprio id e a cidade.
      cityId: me.role === "ADMIN" ? me.id : me.cityId ?? null
    };
  } catch (error) {
    console.error("Falha ao validar a sessao no backend", error);
    return null;
  }
}

export async function requireRole(
  request: Request,
  allowedRoles: string[]
): Promise<SessionResult> {
  const user = await getSessionUser(request);
  if (!user) {
    return {
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    };
  }
  if (!allowedRoles.includes(user.role)) {
    return {
      response: NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    };
  }
  return { user };
}

/** PLATFORM_ADMIN enxerga todas as cidades; os demais apenas a propria. */
export function canActOnCity(user: SessionUser, cityId: string): boolean {
  return user.role === "PLATFORM_ADMIN" || user.cityId === cityId;
}
