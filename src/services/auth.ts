const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Remove trailing slash and ensure /api is included
    const cleanUrl = envUrl.replace(/\/+$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
  }
  return "http://localhost:5000/api";
};

const API_URL = getApiUrl();

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
}

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;
  private storageKey = "projexia_current_user";

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.currentUser = parsed.user || null;
        this.token = parsed.token || null;
      } catch (e) {
        this.currentUser = null;
        this.token = null;
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Login failed");
    }
    const resData = await response.json();
    // resData contains user fields and token
    this.currentUser = {
      id: resData.id,
      name: resData.name,
      email: resData.email,
      avatarUrl: resData.avatarUrl,
      role: resData.role,
    };
    this.token = resData.token || null;
    localStorage.setItem(
      this.storageKey,
      JSON.stringify({ user: this.currentUser, token: this.token }),
    );
    return this.currentUser;
  }

  async signup(data: SignupData): Promise<User> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Signup failed");
    }
    const resData = await response.json();
    this.currentUser = {
      id: resData.id,
      name: resData.name,
      email: resData.email,
      avatarUrl: resData.avatarUrl,
      role: resData.role,
    };
    this.token = resData.token || null;
    localStorage.setItem(
      this.storageKey,
      JSON.stringify({ user: this.currentUser, token: this.token }),
    );
    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.storageKey);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const authService = new AuthService();
