import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import type { ReportingDashboard } from "./reporting.model";

@Injectable({ providedIn: "root" })
export class ReportingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/reporting`;

  dashboard(): Promise<ReportingDashboard> {
    return firstValueFrom(this.http.get<ReportingDashboard>(`${this.baseUrl}/dashboard`));
  }
}
