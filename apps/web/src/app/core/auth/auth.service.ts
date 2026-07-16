import { HttpClient } from "@angular/common/http";
import { Injectable, computed, signal } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";

interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  twoFactorRequired?: boolean;
}

export interface TwoFactorSetup {
  secret: string;
  otpauthUri: string;
}

const ACCESS_TOKEN_KEY = "gs_access_token";
const REFRESH_TOKEN_KEY = "gs_refresh_token";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly accessTokenSignal = signal<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));

  readonly isAuthenticated = computed(() => this.accessTokenSignal() !== null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  get accessToken(): string | null {
    return this.accessTokenSignal();
  }

  /**
   * Authentifie l'utilisateur. Renvoie `{ twoFactorRequired: true }` si un code
   * TOTP est nécessaire ; l'appelant relance alors login() avec le code.
   */
  async login(email: string, password: string, code?: string): Promise<{ twoFactorRequired: boolean }> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password, code })
    );
    if (response.twoFactorRequired) {
      return { twoFactorRequired: true };
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken!);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken!);
    this.accessTokenSignal.set(response.accessToken!);
    return { twoFactorRequired: false };
  }

  setup2fa(): Promise<TwoFactorSetup> {
    return firstValueFrom(this.http.post<TwoFactorSetup>(`${environment.apiBaseUrl}/auth/2fa/setup`, {}));
  }

  enable2fa(code: string): Promise<{ twoFactorEnabled: boolean }> {
    return firstValueFrom(
      this.http.post<{ twoFactorEnabled: boolean }>(`${environment.apiBaseUrl}/auth/2fa/enable`, { code })
    );
  }

  disable2fa(code: string): Promise<{ twoFactorEnabled: boolean }> {
    return firstValueFrom(
      this.http.post<{ twoFactorEnabled: boolean }>(`${environment.apiBaseUrl}/auth/2fa/disable`, { code })
    );
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    this.clearSession();
    if (refreshToken) {
      await firstValueFrom(this.http.post(`${environment.apiBaseUrl}/auth/logout`, { refreshToken }));
    }
    await this.router.navigateByUrl("/login");
  }

  /** Efface la session localement (sans appel API ni navigation) — utilisé par l'intercepteur sur une réponse 401. */
  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.accessTokenSignal.set(null);
  }
}
