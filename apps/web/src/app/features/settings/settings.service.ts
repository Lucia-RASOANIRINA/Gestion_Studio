import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import type { UpdateProfileValue, UserProfile } from "./settings.model";

@Injectable({ providedIn: "root" })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/settings`;

  getProfile(): Promise<UserProfile> {
    return firstValueFrom(this.http.get<UserProfile>(`${this.baseUrl}/me`));
  }

  updateProfile(value: UpdateProfileValue): Promise<UserProfile> {
    return firstValueFrom(this.http.patch<UserProfile>(`${this.baseUrl}/me`, value));
  }
}
