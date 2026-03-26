interface CookieOptions {
  maxAge?: number;
  path?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  httpOnly?: boolean;
  domain?: string;
}

export function getAuthCookieConfig(rememberMe = false): CookieOptions {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENV === "production";

  return {
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
    path: "/",
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    httpOnly: false,
  };
}
