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

  const tokenResponse = await fetch(
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

const extractUserIdFromLocation = (location: string | null) => {
  if (!location) return "";
  const chunks = location.split("/").filter(Boolean);
  return chunks[chunks.length - 1] ?? "";
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

const syncUserInBackend = async (payload: {
  id: string;
  externalId: string;
  email: string;
  displayName: string;
}) => {
  const backendBaseUrl = process.env.NEXT_PUBLIC_BFF_BASE_URL || "http://localhost:8080";

  const response = await fetch(`${backendBaseUrl}/bff/users/internal-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Usuário criado no Keycloak, mas não foi possível salvar no Mongo");
  }
};

export async function POST(request: Request) {
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { uid: "", error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const { accessToken, baseUrl, realm } = await getAdminAccessToken();

    const createResponse = await fetch(`${baseUrl}/admin/realms/${realm}/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: email,
        email,
        enabled: true,
        emailVerified: true,
        credentials: [
          {
            type: "password",
            value: password,
            temporary: false
          }
        ]
      }),
      cache: "no-store"
    });

    if (createResponse.status === 409) {
      return NextResponse.json({ uid: "", error: "Usuário já cadastrado" }, { status: 409 });
    }

    if (!createResponse.ok) {
      return NextResponse.json(
        { uid: "", error: "Não foi possível criar usuário no Keycloak" },
        { status: createResponse.status }
      );
    }

    let uid = extractUserIdFromLocation(createResponse.headers.get("location"));
    if (!uid) {
      uid = await findUserIdByEmail(baseUrl, realm, accessToken, email);
    }

    if (!uid) {
      return NextResponse.json(
        { uid: "", error: "Usuário criado, mas não foi possível recuperar o ID" },
        { status: 500 }
      );
    }

    await syncUserInBackend({
      id: uid,
      externalId: uid,
      email,
      displayName: displayName || email
    });

    return NextResponse.json({ uid, error: null });
  } catch (error: any) {
    return NextResponse.json(
      { uid: "", error: error?.message ?? "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
