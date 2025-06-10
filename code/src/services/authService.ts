import { authService as apiAuthService } from './api/apiService';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
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
      return { accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  public async register(userData: { email: string; password: string; name: string }): Promise<void> {
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

  private clearTokens(): void {
    this.access_token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refreshToken');
  }

  public isAuthenticated(): boolean {
    return !!this.access_token;
  }
}

export default AuthService.getInstance(); 