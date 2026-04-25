import type { ConversationRoom, MessagesPage, User } from "../types";

const BASE = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let currentToken: string | null = null;

export function setApiToken(token: string | null) {
  currentToken = token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (currentToken) headers.Authorization = `Bearer ${currentToken}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      msg = body?.message || body?.error || msg;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const api = {
  login: (identifier: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),

  /** Daftar room. Path ini diasumsikan — sesuaikan kalau endpoint kamu beda. */
  getRooms: () => request<ConversationRoom[]>("/consultation/rooms"),

  getMessages: (roomId: string, cursor?: string) => {
    const q = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return request<MessagesPage>(`/consultation/rooms/${roomId}/messages${q}`);
  },
};
