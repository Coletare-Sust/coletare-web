export const DEV_LOGIN_UID = "dev-admin";

export const DEV_LOGIN_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true";

export const DEV_LOGIN_EMAIL =
  process.env.NEXT_PUBLIC_DEFAULT_LOGIN_EMAIL || "admin@coletare.local";

export const DEV_LOGIN_PASSWORD =
  process.env.NEXT_PUBLIC_DEFAULT_LOGIN_PASSWORD || "admin123";
