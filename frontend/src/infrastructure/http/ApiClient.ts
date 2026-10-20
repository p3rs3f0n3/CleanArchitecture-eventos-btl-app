import { env } from "../config/env";
import { SessionStorage } from "../storage/SessionStorage";
import { ApiError } from "../../domain/errors/ApiError";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = SessionStorage.getToken();
  const res = await fetch(`${env.apiUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? 'Error inesperado del servidor.');
  }

  return data as T;
}

/** Para subir archivos (multipart) — SIN Content-Type manual: el navegador
 *  arma el boundary solo cuando el body es un FormData. */
async function requestFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = SessionStorage.getToken();
  const res = await fetch(`${env.apiUrl}${path}`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? 'Error inesperado del servidor.');
  }

  return data as T;
}

/** Único punto del frontend que sabe hablar HTTP. Los Api*Repository lo usan;
 *  el resto de las capas (application, presentation) no saben que existe fetch. */
export const ApiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  postFormData: <T>(path: string, formData: FormData) => requestFormData<T>(path, formData),
};
