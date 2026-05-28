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

  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(
      `${baseUrl}/realms/${adminRealm}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body,
        cache: "no-store"
      }
    );
  } catch (error: any) {
    throw new Error(`Keycloak indisponível em ${baseUrl}`);
  }

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

const isSmtpConfigured = async (
  baseUrl: string,
  realm: string,
  accessToken: string
) => {
  try {
    const response = await fetch(`${baseUrl}/admin/realms/${realm}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      cache: "no-store"
    });

    if (!response.ok) return false;
    const data = (await response.json()) as { smtpServer?: Record<string, string> };
    return !!data?.smtpServer && Object.keys(data.smtpServer).length > 0;
  } catch {
    return false;
  }
};

const findUserIdByEmail = async (
  baseUrl: string,
  realm: string,
  accessToken: string,
  email: string
) => {
  const response = await fetch(
    `${baseUrl}/admin/realms/${realm}/users?email=${encodeURIComponent(email)}&exact=true`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      cache: "no-store"
    }
  );

  if (!response.ok) return "";
  const users = (await response.json()) as Array<{ id?: string }>;
  return users?.[0]?.id ?? "";
};

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const { accessToken, baseUrl, realm } = await getAdminAccessToken();
    const userId = await findUserIdByEmail(baseUrl, realm, accessToken, email);

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const smtpReady = await isSmtpConfigured(baseUrl, realm, accessToken);
    if (!smtpReady) {
      return NextResponse.json(
        { error: "SMTP não configurado no Keycloak" },
        { status: 500 }
      );
    }

    let response: Response;
    try {
      response = await fetch(
        `${baseUrl}/admin/realms/${realm}/users/${userId}/execute-actions-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(["UPDATE_PASSWORD"]),
          cache: "no-store"
        }
      );
    } catch {
      return NextResponse.json(
        { error: `Keycloak indisponível em ${baseUrl}` },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Não foi possível enviar email de redefinição" },
        { status: response.status }
      );
    }

    return NextResponse.json({ error: null });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Erro ao redefinir senha" },
      { status: 500 }
    );
  }
}
