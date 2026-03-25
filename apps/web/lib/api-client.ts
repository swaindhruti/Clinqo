const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class APIError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
    this.name = "APIError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    // FastAPI returns errors in 'detail' field
    const message = data.message || 
                   (data.detail && typeof data.detail === 'object' ? data.detail.message : data.detail) || 
                   'An error occurred while fetching the data.';
                   
    throw new APIError(
      response.status,
      message,
      data.details || data.detail
    );
  }

  return data as T;
}

const getAuthHeader = (): Record<string, string> => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("clinqo_auth_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
};

export const apiClient = {
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clinqo_auth_token", token);
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("clinqo_auth_token");
      window.location.href = "/sign-in";
    }
  },

  get: async <T>(endpoint: string, params?: Record<string, string>): Promise<T> => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
  },
  
  put: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
  },

  patch: async <T>(endpoint: string, body?: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    return handleResponse<T>(response);
  }
};
