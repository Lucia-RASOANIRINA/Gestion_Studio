import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import type { Client, ClientFormValue, ClientListResponse } from "./client.model";

interface ListClientsParams {
  search?: string;
  segment?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: "root" })
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/clients`;

  list(params: ListClientsParams = {}): Promise<ClientListResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set("search", params.search);
    if (params.segment) httpParams = httpParams.set("segment", params.segment);
    httpParams = httpParams.set("page", params.page ?? 1);
    httpParams = httpParams.set("pageSize", params.pageSize ?? 20);

    return firstValueFrom(this.http.get<ClientListResponse>(this.baseUrl, { params: httpParams }));
  }

  getById(id: string): Promise<Client> {
    return firstValueFrom(this.http.get<Client>(`${this.baseUrl}/${id}`));
  }

  create(value: ClientFormValue): Promise<Client> {
    return firstValueFrom(this.http.post<Client>(this.baseUrl, value));
  }

  update(id: string, value: ClientFormValue): Promise<Client> {
    return firstValueFrom(this.http.put<Client>(`${this.baseUrl}/${id}`, value));
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
