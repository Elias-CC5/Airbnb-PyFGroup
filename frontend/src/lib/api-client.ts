import type { ApiErrorBody } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
/** En SSR y dentro de Docker el backend puede tener otro host. */
const INTERNAL_URL = process.env.API_INTERNAL_URL ?? API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: ApiErrorBody,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

type Token = string | null;

/** El access token vive sólo en memoria; el refresh viaja en cookie HttpOnly. */
let accessToken: Token = null;
let refreshPromise: Promise<boolean> | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: Token) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, unknown>;
  /** Desactiva el reintento automático tras refrescar el token. */
  skipRefresh?: boolean;
  auth?: boolean;
}

function buildUrl(path: string, query?: Record<string, unknown>): string {
  const base = typeof window === 'undefined' ? INTERNAL_URL : API_URL;
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
  });

  return url.toString();
}

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const body = data as ApiErrorBody | null;
    const message = Array.isArray(body?.message)
      ? body!.message.join(' · ')
      : body?.message ?? 'No se pudo completar la solicitud';
    throw new ApiError(response.status, message, body ?? undefined);
  }

  return data as T;
}

/** Renueva el access token usando la cookie de refresh. Se deduplica entre llamadas simultáneas. */
async function refreshSession(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  refreshPromise ??= (async () => {
    try {
      const res = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { tokens: { accessToken: string } };
      tokenStore.set(data.tokens.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, skipRefresh, auth = true, headers, ...rest } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const token = auth ? tokenStore.get() : null;

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    },
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 401 → intenta refrescar una vez y repite la petición original.
  if (response.status === 401 && !skipRefresh && auth && typeof window !== 'undefined') {
    if (await refreshSession()) {
      return apiFetch<T>(path, { ...options, skipRefresh: true });
    }
    tokenStore.clear();
  }

  return parse<T>(response);
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) => apiFetch<T>(path, { ...options, method: 'DELETE' }),
};

/**
 * Fetch para Server Components: sin cookies de sesión, con revalidación ISR.
 * Devuelve null en caso de error para que la página pueda degradar con elegancia.
 */
export async function serverFetch<T>(
  path: string,
  query?: Record<string, unknown>,
  revalidate = 60,
): Promise<T | null> {
  try {
    const res = await fetch(buildUrl(path, query), { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
