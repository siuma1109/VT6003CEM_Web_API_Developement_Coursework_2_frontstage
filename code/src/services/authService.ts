import { authService as apiAuthService, UserData } from './api/apiService';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserData;
}

interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private static instance: AuthService;
  private access_token: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {
    // Initialize tokens from localStorage
    this.access_token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiAuthService.login(credentials);
      const { accessToken, refreshToken } = response.metaData;

      this.setTokens(accessToken, refreshToken);
      return { accessToken, refreshToken, user: response.data };
    } catch (error) {
      throw error;
    }
  }

  public async register(userData: { email: string; password: string; name: string; signUpCode?: string }): Promise<void> {
    try {
      const response = await apiAuthService.register(userData);
      const { accessToken, refreshToken } = response.metaData;

      this.setTokens(accessToken, refreshToken);
    } catch (error) {
      throw error;
    }
  }

  public async logout(): Promise<void> {
    const currentToken = this.getAccessToken();

    if (!currentToken) {
      console.warn('AuthService: No token found for logout');
      this.clearTokens();
      return;
    }

    try {
      await apiAuthService.logout();
      window.location.href = "/";
    } catch (error) {
      console.error('AuthService: Logout API call failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  public getAccessToken(): string | null {
    return this.access_token;
  }

  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    this.access_token = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  public clearTokens(): void {
    this.access_token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refreshToken');
  }

  public isAuthenticated(): boolean {
    return !!this.access_token;
  }
}

const dispatchAuthStateChanged = () => {
  window.dispatchEvent(new Event('authStateChanged'));
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await apiAuthService.login({ email, password });
    localStorage.setItem('access_token', response.metaData.accessToken);
    dispatchAuthStateChanged();
    return {
      accessToken: response.metaData.accessToken,
      refreshToken: response.metaData.refreshToken,
      user: response.data
    };
  } catch (error) {
    throw error;
  }
};

export const register = async (email: string, password: string, name: string, signUpCode: string): Promise<void> => {
  try {
    const response = await apiAuthService.register({ email, password, name, signUpCode });
    localStorage.setItem('access_token', response.metaData.accessToken);
    dispatchAuthStateChanged();
  } catch (error) {
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    localStorage.removeItem('access_token');
    await apiAuthService.logout();
    dispatchAuthStateChanged();
  } catch (error) {
    throw error;
  }
};

export default AuthService.getInstance(); 