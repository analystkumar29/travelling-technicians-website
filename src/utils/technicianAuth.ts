/**
 * Technician Authentication Utilities (Client-Side)
 * Mirrors src/utils/auth.ts pattern for admin auth
 */

const TECH_TOKEN_KEY = 'techAuthToken';
const TECH_INFO_KEY = 'techInfo';

export interface TechnicianInfo {
  technicianId: string;
  name: string;
  role: 'technician';
}

/**
 * Store technician auth token
 */
export function storeTechToken(token: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TECH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store tech token:', error);
    }
  }
}

/**
 * Store technician info
 */
export function storeTechInfo(info: TechnicianInfo): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TECH_INFO_KEY, JSON.stringify(info));
    } catch (error) {
      console.error('Failed to store tech info:', error);
    }
  }
}

/**
 * Get technician auth token
 */
export function getTechToken(): string | null {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(TECH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve tech token:', error);
      return null;
    }
  }
  return null;
}

/**
 * Get technician info
 */
export function getTechInfo(): TechnicianInfo | null {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(TECH_INFO_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Failed to retrieve tech info:', error);
      return null;
    }
  }
  return null;
}

/**
 * Remove technician auth data
 */
export function removeTechAuth(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TECH_TOKEN_KEY);
      localStorage.removeItem(TECH_INFO_KEY);
    } catch (error) {
      console.error('Failed to remove tech auth:', error);
    }
  }
}

/**
 * Check if technician is authenticated
 */
export function isTechAuthenticated(): boolean {
  const token = getTechToken();
  if (!token || token.trim() === '') return false;

  // Basic expiry check (decode JWT payload)
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      removeTechAuth();
      return false;
    }
    return decoded.role === 'technician';
  } catch {
    return false;
  }
}

/**
 * Make authenticated fetch for technician endpoints
 */
export async function techFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getTechToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  // Auto-logout on 401
  if (response.status === 401) {
    removeTechAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/technician/login';
    }
  }

  return response;
}
