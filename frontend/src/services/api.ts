// API service base
const getApiBaseUrl = () => {
  const { protocol, hostname } = window.location;
  const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
  const port = isDevelopment ? ':8000' : '';
  return `${protocol}//${hostname}${port}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem('access_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.status}`);
  }
  
  return response.json();
}