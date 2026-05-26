import { NextResponse } from "next/server";

type KeycloakTokenResponse = {
  access_token?: string;
};

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} não configurado`);
  }
  return value;
};

const getAdminAccessToken = async () => {
  const baseUrl = getRequiredEnv("KEYCLOAK_BASE_URL");
  const realm = getRequiredEnv("KEYCLOAK_REALM");
  const clientId = getRequiredEnv("KEYCLOAK_ADMIN_CLIENT_ID");
  const clientSecret = getRequiredEnv("KEYCLOAK_ADMIN_CLIENT_SECRET");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });

  const tokenResponse = await fetch(
    `${baseUrl}/realms/${realm}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
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

  return {
    accessToken: tokenData.access_token,
    baseUrl,
    realm
  };
};

export async function POST(request: Request) {
  try {
    const userUid = await request.json();
    if (!userUid || typeof userUid !== "string") {
      return NextResponse.json({ error: "ID de usuário inválido" }, { status: 400 });
    }

    const { accessToken, baseUrl, realm } = await getAdminAccessToken();

    const deleteResponse = await fetch(
      `${baseUrl}/admin/realms/${realm}/users/${encodeURIComponent(userUid)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
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
