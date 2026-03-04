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
}

export interface HttpResponse<T> {
  data: T;
  code: number;
  message?: string;
  headers?: Record<string, string>;
}

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
    baseURL: baseURL ?? "",
    timeout: 30000,
  });

  instance.interceptors.request.use((config) => {
    const t = resolveToken();
    if (t) {
      config.headers.Authorization = `Bearer ${t}`;
    }
    return config;
  });
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

export function get<T>(
  url: string,
  config?: HttpRequestConfig
): Promise<HttpResponse<T>> {
  const inst = ensureInitialized();
  return inst
    .get<T>(url, toAxiosConfig(config))
    .then(toHttpResponse);
}

export function post<T>(
  url: string,
  data?: unknown,
  config?: HttpRequestConfig
): Promise<HttpResponse<T>> {
  const inst = ensureInitialized();
  return inst
    .post<T>(url, data, toAxiosConfig(config))
    .then(toHttpResponse);
}

export function put<T>(
  url: string,
  data?: unknown,
  config?: HttpRequestConfig
): Promise<HttpResponse<T>> {
  const inst = ensureInitialized();
  return inst
    .put<T>(url, data, toAxiosConfig(config))
    .then(toHttpResponse);
}

export function patch<T>(
  url: string,
  data?: unknown,
  config?: HttpRequestConfig
): Promise<HttpResponse<T>> {
  const inst = ensureInitialized();
  return inst
    .patch<T>(url, data, toAxiosConfig(config))
    .then(toHttpResponse);
}

export function del<T>(
  url: string,
  config?: HttpRequestConfig
): Promise<HttpResponse<T>> {
  const inst = ensureInitialized();
  return inst
    .delete<T>(url, toAxiosConfig(config))
    .then(toHttpResponse);
}
