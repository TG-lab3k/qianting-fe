const KEY_TOKEN = "access_token";
const KEY_USER_NAME = "user_name";
const KEY_USER_AVATAR = "user_avatar";

export function saveAuthToStorage(token: string, name: string, avatar: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(KEY_TOKEN, token);
  sessionStorage.setItem(KEY_USER_NAME, name);
  sessionStorage.setItem(KEY_USER_AVATAR, avatar);
}

export function clearAuthFromStorage(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(KEY_TOKEN);
  sessionStorage.removeItem(KEY_USER_NAME);
  sessionStorage.removeItem(KEY_USER_AVATAR);
}

export function getStoredToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(KEY_TOKEN);
}

export function getStoredUser(): { name: string; avatar: string } | null {
  if (typeof sessionStorage === "undefined") return null;
  const token = sessionStorage.getItem(KEY_TOKEN);
  if (!token) return null;
  const name = sessionStorage.getItem(KEY_USER_NAME) ?? "";
  const avatar = sessionStorage.getItem(KEY_USER_AVATAR) ?? "";
  return { name, avatar };
}
