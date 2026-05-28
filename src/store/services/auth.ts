import { bffLogin, bffLogout, bffResetPassword } from "@/store/services/bffAuth";

type AuthUser = {
  uid: string;
  email?: string;
  roles?: string[];
} | null;

export const waitForUser = async (callback: (user: AuthUser) => void) => {
  try {
    const response = await fetch("/api/bff/auth/me", { method: "GET" });
    const data = await response.json();
    if (data?.authenticated) {
      callback({ uid: data.userId || data.uid || "", email: data.email, roles: data.roles });
      return;
    }
  } catch {
    // ignore
  }
  callback(null);
};

export const loginWithGoogle = async () => {
  return {
    user: null,
    error: "Login com Google não está disponível no Keycloak"
  };
};

export const loginWithFacebook = async () => {
  return {
    user: null,
    error: "Login com Facebook não está disponível no Keycloak"
  };
};

export const createUserWithEmailAndPasswordLocal = async (
  email: string,
  password: string
) => {
  const response = await fetch("/api/createAuth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  return {
    user: data?.uid ? { uid: data.uid, email } : null,
    error: data?.error ?? null
  };
};

export const signInWithEmailAndPasswordLocal = async (
  email: string,
  password: string
) => {
  const response = await bffLogin(email, password);
  if (!response?.error && response?.user?.uid) {
    return { user: response.user, error: null };
  }
  return { user: null, error: response?.error ?? "Credenciais inválidas" };
};

export const recoverPassword = async (email: string) => {
  const response = await bffResetPassword(email);
  return { error: response?.error ?? null };
};

export const deleteOwnAccount = async () => {
  return { error: "Remoção de conta deve ser feita via Keycloak Admin" };
};

export const updatePassword = async (password: string) => {
  return { error: "Atualização de senha deve ser feita via Keycloak" };
};

export const logout = async () => {
  await bffLogout();
};
