import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import type { Booking, BookingEngineerRef, BookingFormValue, StudioRoom } from "./planning.model";

interface ListBookingsParams {
  from: string;
  to: string;
  studio?: StudioRoom;
  engineerId?: string;
}

@Injectable({ providedIn: "root" })
export class PlanningService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/planning`;

  async list(params: ListBookingsParams): Promise<Booking[]> {
    let httpParams = new HttpParams().set("from", params.from).set("to", params.to);
    if (params.studio) httpParams = httpParams.set("studio", params.studio);
    if (params.engineerId) httpParams = httpParams.set("engineerId", params.engineerId);

    const response = await firstValueFrom(
      this.http.get<{ items: Booking[] }>(this.baseUrl, { params: httpParams })
    );
    return response.items;
  }

  async listEngineers(): Promise<BookingEngineerRef[]> {
    const response = await firstValueFrom(
      this.http.get<{ items: BookingEngineerRef[] }>(`${this.baseUrl}/engineers`)
    );
    return response.items;
  }

  getById(id: string): Promise<Booking> {
    return firstValueFrom(this.http.get<Booking>(`${this.baseUrl}/${id}`));
  }

  create(value: BookingFormValue): Promise<Booking> {
    return firstValueFrom(this.http.post<Booking>(this.baseUrl, value));
  }

  update(id: string, value: BookingFormValue): Promise<Booking> {
    return firstValueFrom(this.http.put<Booking>(`${this.baseUrl}/${id}`, value));
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }

  icsUrl(id: string): string {
    return `${this.baseUrl}/${id}/ics`;
  }
}
