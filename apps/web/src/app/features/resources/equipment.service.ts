import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import type {
  Equipment,
  EquipmentFormValue,
  EquipmentListResponse,
  MaintenanceFormValue,
  MaintenanceRecord,
} from "./resource.model";

interface ListEquipmentParams {
  search?: string;
  category?: string;
  status?: string;
  pageSize?: number;
}

@Injectable({ providedIn: "root" })
export class EquipmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/resources/equipment`;

  list(params: ListEquipmentParams = {}): Promise<EquipmentListResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set("search", params.search);
    if (params.category) httpParams = httpParams.set("category", params.category);
    if (params.status) httpParams = httpParams.set("status", params.status);
    httpParams = httpParams.set("page", 1).set("pageSize", params.pageSize ?? 50);

    return firstValueFrom(this.http.get<EquipmentListResponse>(this.baseUrl, { params: httpParams }));
  }

  getById(id: string): Promise<Equipment> {
    return firstValueFrom(this.http.get<Equipment>(`${this.baseUrl}/${id}`));
  }

  create(value: EquipmentFormValue): Promise<Equipment> {
    return firstValueFrom(this.http.post<Equipment>(this.baseUrl, value));
  }

  update(id: string, value: EquipmentFormValue): Promise<Equipment> {
    return firstValueFrom(this.http.put<Equipment>(`${this.baseUrl}/${id}`, value));
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }

  listMaintenance(id: string): Promise<MaintenanceRecord[]> {
    return firstValueFrom(this.http.get<MaintenanceRecord[]>(`${this.baseUrl}/${id}/maintenance`));
  }

  addMaintenance(id: string, value: MaintenanceFormValue): Promise<MaintenanceRecord> {
    return firstValueFrom(
      this.http.post<MaintenanceRecord>(`${this.baseUrl}/${id}/maintenance`, value)
    );
  }
}
