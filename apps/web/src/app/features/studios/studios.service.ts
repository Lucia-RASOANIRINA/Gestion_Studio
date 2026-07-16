import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import type { Studio, StudioFormValue, StudioListResponse } from "./studio.model";

@Injectable({ providedIn: "root" })
export class StudiosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/studios`;

  list(params: { status?: string; type?: string } = {}): Promise<StudioListResponse> {
    let httpParams = new HttpParams().set("pageSize", 100);
    if (params.status) httpParams = httpParams.set("status", params.status);
    if (params.type) httpParams = httpParams.set("type", params.type);
    return firstValueFrom(this.http.get<StudioListResponse>(this.baseUrl, { params: httpParams }));
  }

  getById(id: string): Promise<Studio> {
    return firstValueFrom(this.http.get<Studio>(`${this.baseUrl}/${id}`));
  }

  create(value: StudioFormValue): Promise<Studio> {
    return firstValueFrom(this.http.post<Studio>(this.baseUrl, value));
  }

  update(id: string, value: StudioFormValue): Promise<Studio> {
    return firstValueFrom(this.http.put<Studio>(`${this.baseUrl}/${id}`, value));
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
