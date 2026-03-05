const KEY_TOKEN = "access_token";
const KEY_USER_NAME = "user_name";
const KEY_USER_AVATAR = "user_avatar";

export function saveAuthToStorage(token: string, name: string, avatar: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY_TOKEN, token);
  localStorage.setItem(KEY_USER_NAME, name);
  localStorage.setItem(KEY_USER_AVATAR, avatar);
}

export function clearAuthFromStorage(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_USER_NAME);
  localStorage.removeItem(KEY_USER_AVATAR);
}

export function getStoredToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(KEY_TOKEN);
}

export function getStoredUser(): { name: string; avatar: string } | null {
  if (typeof localStorage === "undefined") return null;
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) return null;
  const name = localStorage.getItem(KEY_USER_NAME) ?? "";
  const avatar = localStorage.getItem(KEY_USER_AVATAR) ?? "";
  return { name, avatar };
}
