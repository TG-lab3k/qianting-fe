const KEY_TOKEN = "access_token";
const KEY_REFRESH = "refresh_token";
const KEY_USER_NAME = "user_name";
const KEY_USER_AVATAR = "user_avatar";

export function saveAuthToStorage(
  accessToken: string,
  refreshToken: string,
  name: string,
  avatar: string
): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY_TOKEN, accessToken);
  localStorage.setItem(KEY_REFRESH, refreshToken);
  localStorage.setItem(KEY_USER_NAME, name);
  localStorage.setItem(KEY_USER_AVATAR, avatar);
}

export function clearAuthFromStorage(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_REFRESH);
  localStorage.removeItem(KEY_USER_NAME);
  localStorage.removeItem(KEY_USER_AVATAR);
}

export function getStoredToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(KEY_TOKEN);
}

export function getStoredRefreshToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(KEY_REFRESH);
}

export function getStoredUser(): { name: string; avatar: string } | null {
  if (typeof localStorage === "undefined") return null;
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) return null;
  const name = localStorage.getItem(KEY_USER_NAME) ?? "";
  const avatar = localStorage.getItem(KEY_USER_AVATAR) ?? "";
  return { name, avatar };
}
