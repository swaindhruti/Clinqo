import { getAuthToken } from "@/lib/auth";

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const API_BASE_URL = (() => {
  const trimmed = RAW_API_BASE_URL.replace(/\/$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
})();

export class APIError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
    this.name = "APIError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const isNoContent = response.status === 204 || response.status === 205;
  const data = isNoContent ? null : (isJson ? await response.json() : await response.text());
  
  if (!response.ok) {
    // FastAPI returns errors in 'detail' field
    const detailObj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
    const message = (detailObj?.message as string) || 
                   (detailObj?.detail && typeof detailObj.detail === 'object' ? (detailObj.detail as Record<string, unknown>).message as string : detailObj?.detail as string) || 
                   'An error occurred while fetching the data.';
                   
    throw new APIError(
      response.status,
      message,
      detailObj?.details || detailObj?.detail
    );
  }

  return data as T;
}

function buildHeaders() {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export const apiClient = {
  get: async <T>(endpoint: string, params?: Record<string, string>): Promise<T> => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: buildHeaders(),
    });

    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
  },
  
  put: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });

    return handleResponse<T>(response);
  }
};
