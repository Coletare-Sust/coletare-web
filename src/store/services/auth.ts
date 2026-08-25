import { apiFetch } from "@/utils/apiFetch";

export const waitForUser = async (callback: (user: any | null) => void) => {
  try {
    const user = await apiFetch<any>("/auth/me");
    if (user && user.id) {
      callback({ uid: user.id, emailVerified: true, ...user });
    } else {
      callback(null);
    }
  } catch (err) {
    callback(null);
  }
};

export const loginWithGoogle = async () => {
  return {
    user: null,
    error: "Método de login não suportado."
  };
};

export const loginWithFacebook = async () => {
  return {
    user: null,
    error: "Método de login não suportado."
  };
};

export const createUserWithEmailAndPasswordLocal = async (
  email: string,
  password: string
) => {
  return {
    user: null,
    error: "Método não suportado, utilize o endpoint de cadastro adequado."
  };
};

export const signInWithEmailAndPasswordLocal = async (
  email: string,
  password: string
) => {
  try {
    console.log(`${process.env.NEXT_PUBLIC_API_URL}`);
    const payload = await apiFetch<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, authType: "LOCAL" })
    });
    return {
      user: {
        uid: payload.user?.id,
        emailVerified: true,
        ...payload.user
      },
      error: null
    };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const recoverPassword = async (email: string) => {
  try {
    await apiFetch("/auth/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteOwnAccount = async () => {
  return {
    error: "Deleção de conta não suportada diretamente via Service atualmente."
  };
};

export const updatePassword = async (password: string) => {
  return {
    error: "Atualização direta de senha interna não autorizada globalmente."
  };
};

export const logout = async () => {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch (e) {
    console.error("Erro no logout remoto", e);
  }
};

export const registerVehicle = async (data: any) => {
  return await apiFetch("/auth/register/vehicle", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const registerEmployee = async (data: any) => {
  return await apiFetch("/auth/register/employee", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const registerCity = async (data: FormData) => {
  // registerCity receives a multipart form data
  return await apiFetch("/auth/register/city", {
    method: "POST",
    body: data // Form data is directly sent
    // do not stringify FormData
  });
};
