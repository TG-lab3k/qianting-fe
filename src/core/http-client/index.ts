import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

// ─── Types (Axios-agnostic, for consumers) ──────────────────────────────────

export interface HttpRequestConfig {
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  /** 覆盖单例默认 baseURL（如认证服务走另一 host） */
  baseURL?: string;
}

/** 业务 API 返回 401 时的统一文案 */
export const SESSION_EXPIRED_MESSAGE = "登录已过期, 请重新登录";

export interface HttpResponse<T> {
  data: T;
  code: number;
  message?: string;
  headers?: Record<string, string>;
}

/** 服务端返回 code 非 0 时抛出，携带 code 与 message */
export class ApiError extends Error {
  code: number;
  override message: string;
  constructor(code: number, message?: string) {
    const msg = message ?? "接口异常";
    super(msg);
    this.name = "ApiError";
    this.code = code;
    this.message = msg;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/** 请求结果：成功为 { ok: true, data }，失败为 { ok: false, errorCode, errorMessage } */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; errorCode: number; errorMessage: string };

// ─── API base (single source of truth for server host) ───────────────────────

/** 服务端 API 根地址，供 initHttpClient 默认 baseURL 及需要绝对 URL 的场景使用 */
export const API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE
    ? process.env.NEXT_PUBLIC_API_BASE
    : typeof process !== "undefined" && process.env.NODE_ENV === "development"
      ? "http://localhost:8080"
      : "https://api.qianting.xyz";

// ─── Singleton & token state ─────────────────────────────────────────────────

let instance: ReturnType<typeof axios.create> | null = null;
let getToken: (() => string | null) | null = null;
let tokenValue: string | null = null;
let onUnauthorized: (() => void) | null = null;
let unauthorizedHandling = false;

const NOT_INITIALIZED =
  "http-client: initHttpClient() must be called before making requests.";

function resolveToken(): string | null {
  if (getToken) return getToken();
  return tokenValue;
}

function normalizeBase(url: string): string {
  return url.replace(/\/$/, "");
}

/** 仅业务 API（默认 API_BASE）的 401 触发会话失效；认证 host 请求跳过 */
function isBusinessApiRequest(config?: AxiosRequestConfig): boolean {
  const base = normalizeBase(config?.baseURL ?? API_BASE);
  return base === normalizeBase(API_BASE);
}

function bodyHasUnauthorizedCode(data: unknown): boolean {
  if (data == null || typeof data !== "object") return false;
  const code = (data as { code?: number; status?: number }).code
    ?? (data as { status?: number }).status;
  return code === 401;
}

function notifyUnauthorized(config?: AxiosRequestConfig): void {
  if (!isBusinessApiRequest(config)) return;
  if (!resolveToken()) return;
  if (unauthorizedHandling) return;
  unauthorizedHandling = true;
  try {
    onUnauthorized?.();
  } catch (e) {
    if (typeof console !== "undefined" && console.error) {
      console.error("[http-client] onUnauthorized error:", e);
    }
  }
}

/** 登录成功后重置，以便下次 401 可再次触发 */
export function resetUnauthorizedHandling(): void {
  unauthorizedHandling = false;
}

/** 注册 / 更新业务 API 401 回调（清登录态、提示等） */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

/** 将响应错误（如 AxiosError）转为 ApiError，供 toFailedResult 统一处理 */
function responseErrorToApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  const err = error as { response?: { status: number; data?: unknown; statusText?: string }; message?: string };
  if (err.response) {
    const code = err.response.status;
    const data = err.response.data;
    const message =
      data != null &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : err.response.statusText || (error instanceof Error ? error.message : "请求失败");
    return new ApiError(code, message);
  }
  const message = error instanceof Error ? error.message : "请求失败";
  return new ApiError(-1, message);
}

// ─── Initialization ──────────────────────────────────────────────────────────

export interface InitHttpClientOptions {
  getToken?: () => string | null;
  token?: string | null;
  baseURL?: string;
  /** 业务 API 返回 401 且当前有登录态时调用 */
  onUnauthorized?: () => void;
}

export function initHttpClient(options: InitHttpClientOptions = {}): void {
  if (options.onUnauthorized !== undefined) {
    onUnauthorized = options.onUnauthorized;
  }
  if (instance) return;

  const { getToken: gt, token, baseURL } = options;
  getToken = gt ?? null;
  tokenValue = token ?? null;

  instance = axios.create({
    baseURL: baseURL ?? API_BASE,
    timeout: 30000,
  });

  instance.interceptors.request.use((config) => {
    const t = resolveToken();
    if (t) {
      config.headers.Authorization = `Bearer ${t}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      if (bodyHasUnauthorizedCode(response.data)) {
        notifyUnauthorized(response.config);
      }
      return response;
    },
    (error: unknown) => {
      const apiErr = responseErrorToApiError(error);
      if (apiErr.code === 401) {
        const cfg = (error as AxiosError | undefined)?.config;
        notifyUnauthorized(cfg);
      }
      return Promise.reject(apiErr);
    }
  );
}

export function setAuthToken(token: string | null): void {
  tokenValue = token;
}

// ─── Request helpers (Axios-agnostic API) ─────────────────────────────────────

function ensureInitialized(): NonNullable<typeof instance> {
  if (!instance) {
    if (typeof console !== "undefined" && console.warn) {
      console.warn(NOT_INITIALIZED);
    }
    throw new Error(NOT_INITIALIZED);
  }
  return instance;
}

function toAxiosConfig(config?: HttpRequestConfig): AxiosRequestConfig {
  if (!config) return {};
  return {
    params: config.params,
    data: config.data,
    headers: config.headers,
    timeout: config.timeout,
    baseURL: config.baseURL,
  };
}

function toHttpResponse<T>(res: AxiosResponse<T>): HttpResponse<T> {
  const headers: Record<string, string> = {};
  if (res.headers && typeof res.headers === "object") {
    for (const [k, v] of Object.entries(res.headers)) {
      if (typeof v === "string") headers[k] = v;
    }
  }
  const body = res.data;
  const message =
    body != null && typeof body === "object" && "message" in body && typeof (body as { message?: unknown }).message === "string"
      ? (body as { message: string }).message
      : undefined;
  return {
    data: res.data,
    code: res.status,
    message,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  };
}

/** 将响应 body 转为 Result<T>：T 为业务层传入的 payload 类型，成功时只返回 body.data（即 HttpResponse.data） */
function toResultHttpResponse<T>(
  res: AxiosResponse<Record<string, unknown> & { data?: T }>
): Result<T> {
  const body = res.data;
  if (body != null && typeof body === "object") {
    const code = (body as { code?: number; status?: number }).code ?? (body as { code?: number; status?: number }).status;
    if (code !== undefined && code !== 0) {
      const fallback = (body as { message?: string }).message ?? "接口异常";
      const msg =
        code === 401
          ? unauthorizedHandling
            ? SESSION_EXPIRED_MESSAGE
            : "请登录后再使用分析功能"
          : fallback;
      return { ok: false, errorCode: code, errorMessage: msg };
    }
  }
  const payload =
    body != null && typeof body === "object" && "data" in body && (body as { data?: T }).data !== undefined
      ? (body as { data: T }).data
      : (res.data as T);
  return { ok: true, data: payload };
}

function toFailedResult(err: unknown): Result<never> {
  const errorCode = err instanceof ApiError ? err.code : -1;
  const fallback =
    err instanceof ApiError
      ? err.message
      : err instanceof Error
        ? err.message
        : "请求失败";
  const errorMessage =
    errorCode === 401
      ? unauthorizedHandling
        ? SESSION_EXPIRED_MESSAGE
        : "请登录后再使用分析功能"
      : fallback;
  return { ok: false, errorCode, errorMessage };
}

export function get<T>(
  url: string,
  config?: HttpRequestConfig
): Promise<Result<T>> {
  const inst = ensureInitialized();
  return inst
    .get<Record<string, unknown> & { data?: T }>(url, toAxiosConfig(config))
    .then(toResultHttpResponse)
    .catch(toFailedResult);
}

export function post<T>(
  url: string,
  data?: unknown,
  config?: HttpRequestConfig
): Promise<Result<T>> {
  const inst = ensureInitialized();
  return inst
    .post<Record<string, unknown> & { data?: T }>(url, data, toAxiosConfig(config))
    .then(toResultHttpResponse)
    .catch(toFailedResult);
}

export function put<T>(
  url: string,
  data?: unknown,
  config?: HttpRequestConfig
): Promise<Result<T>> {
  const inst = ensureInitialized();
  return inst
    .put<Record<string, unknown> & { data?: T }>(url, data, toAxiosConfig(config))
    .then(toResultHttpResponse)
    .catch(toFailedResult);
}

export function patch<T>(
  url: string,
  data?: unknown,
  config?: HttpRequestConfig
): Promise<Result<T>> {
  const inst = ensureInitialized();
  return inst
    .patch<Record<string, unknown> & { data?: T }>(url, data, toAxiosConfig(config))
    .then(toResultHttpResponse)
    .catch(toFailedResult);
}

export function del<T>(
  url: string,
  config?: HttpRequestConfig
): Promise<Result<T>> {
  const inst = ensureInitialized();
  return inst
    .delete<Record<string, unknown> & { data?: T }>(url, toAxiosConfig(config))
    .then(toResultHttpResponse)
    .catch(toFailedResult);
}
