// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserVo {
  token: string | null;
  name: string;
  avatar: string;
}

export interface UserManager {
  getToken(): string | null;
  setToken(value: string | null): void;
  getName(): string;
  setName(value: string): void;
  getAvatar(): string;
  setAvatar(value: string): void;
  getUser(): UserVo;
  setUser(user: Partial<UserVo> | null): void;
  login(user: UserVo): void;
  logout(): void;
  onLogin(callback: (user: UserVo) => void): () => void;
  onLogout(callback: (prevUser: UserVo | null) => void): () => void;
}

// ─── Singleton & event state ───────────────────────────────────────────────────

const defaultUser: UserVo = {
  token: null,
  name: "",
  avatar: "",
};

let state: UserVo = { ...defaultUser };
const loginListeners = new Set<(user: UserVo) => void>();
const logoutListeners = new Set<(prevUser: UserVo | null) => void>();

function emitLogin(user: UserVo): void {
  loginListeners.forEach((cb) => {
    try {
      cb(user);
    } catch (e) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[UserManager] onLogin callback error:", e);
      }
    }
  });
}

function emitLogout(prevUser: UserVo | null): void {
  logoutListeners.forEach((cb) => {
    try {
      cb(prevUser);
    } catch (e) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[UserManager] onLogout callback error:", e);
      }
    }
  });
}

// ─── UserManager implementation ───────────────────────────────────────────────

function createUserManager(): UserManager {
  return {
    getToken() {
      return state.token;
    },
    setToken(value) {
      state.token = value;
    },
    getName() {
      return state.name;
    },
    setName(value) {
      state.name = value;
    },
    getAvatar() {
      return state.avatar;
    },
    setAvatar(value) {
      state.avatar = value;
    },
    getUser() {
      return { ...state };
    },
    setUser(user) {
      if (user === null) {
        state = { ...defaultUser };
        return;
      }
      if (user.token !== undefined) state.token = user.token;
      if (user.name !== undefined) state.name = user.name;
      if (user.avatar !== undefined) state.avatar = user.avatar;
    },
    login(user) {
      state = {
        token: user.token ?? null,
        name: user.name ?? "",
        avatar: user.avatar ?? "",
      };
      emitLogin(state);
    },
    logout() {
      const prev = { ...state };
      state = { ...defaultUser };
      emitLogout(prev);
    },
    onLogin(callback) {
      loginListeners.add(callback);
      return () => loginListeners.delete(callback);
    },
    onLogout(callback) {
      logoutListeners.add(callback);
      return () => logoutListeners.delete(callback);
    },
  };
}

// ─── Singleton access ────────────────────────────────────────────────────────

let instance: UserManager | null = null;

export function getUserManager(): UserManager {
  if (!instance) {
    instance = createUserManager();
  }
  return instance;
}
