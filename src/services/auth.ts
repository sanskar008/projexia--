const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  private storageKey = 'projexia_current_user';

  constructor() {
    const storedUser = localStorage.getItem(this.storageKey);
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }
    const user = await response.json();
    this.currentUser = user;
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    return user;
  }

  async signup(data: SignupData): Promise<User> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Signup failed');
    }
    const user = await response.json();
    this.currentUser = user;
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    return user;
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
}

export const authService = new AuthService(); 