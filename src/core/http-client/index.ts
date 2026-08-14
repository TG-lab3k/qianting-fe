import axios, {
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

const NOT_INITIALIZED =
  "http-client: initHttpClient() must be called before making requests.";

function resolveToken(): string | null {
  if (getToken) return getToken();
  return tokenValue;
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
}

export function initHttpClient(options: InitHttpClientOptions = {}): void {
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

  instance.interceptors.response.use(undefined, (error: unknown) =>
    Promise.reject(responseErrorToApiError(error))
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

/** 根据响应 body 的 code/status 转为 Result，不抛错；成功直接返回 body */
function toResult<T>(res: AxiosResponse<T>): Result<T> {
  const body = res.data;
  if (body != null && typeof body === "object") {
    const code = (body as { code?: number; status?: number }).code ?? (body as { code?: number; status?: number }).status;
    if (code !== undefined && code !== 0) {
      const msg = (body as { message?: string }).message ?? "接口异常";
      return { ok: false, errorCode: code, errorMessage: msg };
    }
  }
  return { ok: true, data: res.data };
}

/** 将响应 body 转为 Result<T>：T 为业务层传入的 payload 类型，成功时只返回 body.data（即 HttpResponse.data） */
function toResultHttpResponse<T>(
  res: AxiosResponse<Record<string, unknown> & { data?: T }>
): Result<T> {
  const body = res.data;
  if (body != null && typeof body === "object") {
    const code = (body as { code?: number; status?: number }).code ?? (body as { code?: number; status?: number }).status;
    if (code !== undefined && code !== 0) {
      const msg = (body as { message?: string }).message ?? "接口异常";
      console.log(`toResultHttpResponse __ ${code} ${msg}`);
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
  console.log(`toFailedResult __ ${err}`);
  const errorCode = err instanceof ApiError ? err.code : -1;
  const errorMessage =
    err instanceof ApiError ? err.message : err instanceof Error ? err.message : "请求失败";
  console.log(`toFailedResult __ ${errorCode} ${errorMessage}`);
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
