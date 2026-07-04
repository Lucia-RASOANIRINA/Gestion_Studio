import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import type { Project, ProjectFormValue, ProjectListResponse, ProjectStatus } from "./project.model";

interface ListProjectsParams {
  search?: string;
  status?: string;
  clientId?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: "root" })
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/projects`;

  list(params: ListProjectsParams = {}): Promise<ProjectListResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set("search", params.search);
    if (params.status) httpParams = httpParams.set("status", params.status);
    if (params.clientId) httpParams = httpParams.set("clientId", params.clientId);
    httpParams = httpParams.set("page", params.page ?? 1);
    httpParams = httpParams.set("pageSize", params.pageSize ?? 50);

    return firstValueFrom(this.http.get<ProjectListResponse>(this.baseUrl, { params: httpParams }));
  }

  getById(id: string): Promise<Project> {
    return firstValueFrom(this.http.get<Project>(`${this.baseUrl}/${id}`));
  }

  create(value: ProjectFormValue): Promise<Project> {
    return firstValueFrom(this.http.post<Project>(this.baseUrl, value));
  }

  update(id: string, value: ProjectFormValue): Promise<Project> {
    return firstValueFrom(this.http.put<Project>(`${this.baseUrl}/${id}`, value));
  }

  transition(id: string, status: ProjectStatus): Promise<Project> {
    return firstValueFrom(this.http.post<Project>(`${this.baseUrl}/${id}/transition`, { status }));
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
