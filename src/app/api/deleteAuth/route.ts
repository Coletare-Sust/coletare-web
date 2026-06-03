import { NextResponse } from "next/server";

type KeycloakTokenResponse = {
  access_token?: string;
};

const skipKeycloak = () => process.env.SKIP_KEYCLOAK === "true";

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não configurado`);
  return value;
};

const getAdminAccessToken = async () => {
  const baseUrl = getRequiredEnv("KEYCLOAK_BASE_URL");
  const realm = getRequiredEnv("KEYCLOAK_REALM");
  const adminRealm = process.env.KEYCLOAK_ADMIN_REALM || "master";
  const clientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID || "admin-cli";
  const username = process.env.KEYCLOAK_ADMIN_USERNAME || "admin";
  const password = process.env.KEYCLOAK_ADMIN_PASSWORD || "admin";

  const body = new URLSearchParams({
    grant_type: "password",
    client_id: clientId,
    username,
    password
  });

  const tokenResponse = await fetch(
    `${baseUrl}/realms/${adminRealm}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store"
    }
  );

  if (!tokenResponse.ok) {
    throw new Error("Não foi possível autenticar no Keycloak Admin");
  }

  const tokenData = (await tokenResponse.json()) as KeycloakTokenResponse;
  if (!tokenData.access_token) {
    throw new Error("Token de acesso do Keycloak inválido");
  }

  return { accessToken: tokenData.access_token, baseUrl, realm };
};

export async function POST(request: Request) {
  try {
    const userUid = await request.json();

    if (!userUid || typeof userUid !== "string") {
      return NextResponse.json({ error: "ID de usuário inválido" }, { status: 400 });
    }

    // Bypass Keycloak: remoção do Keycloak pulada, MongoDB é deletado pelo service diretamente
    if (skipKeycloak()) {
      return NextResponse.json({ error: null });
    }

    const { accessToken, baseUrl, realm } = await getAdminAccessToken();

    const deleteResponse = await fetch(
      `${baseUrl}/admin/realms/${realm}/users/${encodeURIComponent(userUid)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store"
      }
    );

    if (!deleteResponse.ok && deleteResponse.status !== 404) {
      return NextResponse.json(
        { error: "Não foi possível remover usuário no Keycloak" },
        { status: deleteResponse.status }
      );
    }

    return NextResponse.json({ error: null });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Erro ao remover usuário" },
      { status: 500 }
    );
  }
}
