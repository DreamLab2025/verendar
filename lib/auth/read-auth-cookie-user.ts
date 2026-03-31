import { getCookie } from "cookies-next";

export type AuthCookieUser = {
  displayName: string;
  userName: string;
  email: string;
  initials: string;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export function getInitialsFromDisplayName(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const first = words[0].charAt(0);
    const last = words[words.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

/** Đọc user hiển thị từ JWT trong cookie (client). */
export function readAuthUserFromCookies(): AuthCookieUser | null {
  const token =
    (getCookie("authToken") as string | undefined) ?? (getCookie("auth-token") as string | undefined);
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const email = str(payload.email) ?? "";
  const userName =
    str(payload.userName) ?? str(payload.unique_name) ?? (email ? email.split("@")[0] : "") ?? "";
  const givenFamily = [str(payload.given_name), str(payload.family_name)].filter(Boolean).join(" ").trim();
  const displayName =
    str(payload.name) || givenFamily || userName || email || "Tài khoản";

  const initials = getInitialsFromDisplayName(displayName === "Tài khoản" ? userName || email || "?" : displayName);

  return {
    displayName,
    userName: userName || "—",
    email: email || "—",
    initials,
  };
}
