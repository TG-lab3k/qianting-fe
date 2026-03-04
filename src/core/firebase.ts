import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (getApps().length > 0) return getApp();
  const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;
  if (!hasConfig) return null;
  return initializeApp(firebaseConfig);
}

/** 获取 Firebase Auth 实例，未配置或非浏览器环境返回 null */
export function getAuthOrNull() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

/** 使用 Google 弹窗登录，返回 Firebase User；未配置或取消时抛错或返回 null */
export async function signInWithGoogle(): Promise<User | null> {
  const auth = getAuthOrNull();
  if (!auth) {
    throw new Error("Firebase 未配置，请设置 NEXT_PUBLIC_FIREBASE_* 环境变量");
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/** 获取当前用户的 id_token（用于调用后端 /auth/login） */
export async function getIdToken(user: User): Promise<string> {
  const token = await user.getIdToken();
  if (!token) throw new Error("无法获取 id_token");
  return token;
}
