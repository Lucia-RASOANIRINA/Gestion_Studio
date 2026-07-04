import { HttpClient } from "@angular/common/http";
import { Injectable, computed, signal } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
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

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password })
    );
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    this.accessTokenSignal.set(response.accessToken);
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.accessTokenSignal.set(null);
    if (refreshToken) {
      await firstValueFrom(this.http.post(`${environment.apiBaseUrl}/auth/logout`, { refreshToken }));
    }
    await this.router.navigateByUrl("/login");
  }
}
