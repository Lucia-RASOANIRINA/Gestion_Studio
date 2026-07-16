import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import type { Consumable, ConsumableFormValue, ConsumableListResponse } from "./resource.model";

interface ListConsumablesParams {
  search?: string;
  lowStockOnly?: boolean;
  pageSize?: number;
}

@Injectable({ providedIn: "root" })
export class ConsumableService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/resources/consumables`;

  list(params: ListConsumablesParams = {}): Promise<ConsumableListResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set("search", params.search);
    if (params.lowStockOnly) httpParams = httpParams.set("lowStockOnly", "true");
    httpParams = httpParams.set("page", 1).set("pageSize", params.pageSize ?? 50);

    return firstValueFrom(this.http.get<ConsumableListResponse>(this.baseUrl, { params: httpParams }));
  }

  getById(id: string): Promise<Consumable> {
    return firstValueFrom(this.http.get<Consumable>(`${this.baseUrl}/${id}`));
  }

  create(value: ConsumableFormValue): Promise<Consumable> {
    return firstValueFrom(this.http.post<Consumable>(this.baseUrl, value));
  }

  update(id: string, value: ConsumableFormValue): Promise<Consumable> {
    return firstValueFrom(this.http.put<Consumable>(`${this.baseUrl}/${id}`, value));
  }

  adjust(id: string, delta: number): Promise<Consumable> {
    return firstValueFrom(this.http.post<Consumable>(`${this.baseUrl}/${id}/adjust`, { delta }));
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
