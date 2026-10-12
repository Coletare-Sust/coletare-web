const PRODUCTION_API_URL = "https://api.coletapp.com";
const DEVELOPMENT_API_URL = "http://localhost:8080";

/**
 * URL base da API. Em desenvolvimento nunca cai em producao por engano: sem
 * NEXT_PUBLIC_API_URL usa o backend local. Producao so usa o fallback no build de producao.
 */
export function getApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  const fallback =
    process.env.NODE_ENV === "production"
      ? PRODUCTION_API_URL
      : DEVELOPMENT_API_URL;

  return (configured || fallback).replace(/\/$/, "");
}
