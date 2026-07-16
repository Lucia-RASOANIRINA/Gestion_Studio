import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import type {
  Employee,
  EmployeeFormValue,
  EmployeeListResponse,
  LeaveFormValue,
  LeaveRequest,
  LeaveStatus,
} from "./hr.model";

@Injectable({ providedIn: "root" })
export class HrService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/hr`;

  listEmployees(params: { search?: string; type?: string } = {}): Promise<EmployeeListResponse> {
    let httpParams = new HttpParams().set("pageSize", 100);
    if (params.search) httpParams = httpParams.set("search", params.search);
    if (params.type) httpParams = httpParams.set("type", params.type);
    return firstValueFrom(this.http.get<EmployeeListResponse>(`${this.baseUrl}/employees`, { params: httpParams }));
  }

  getEmployee(id: string): Promise<Employee> {
    return firstValueFrom(this.http.get<Employee>(`${this.baseUrl}/employees/${id}`));
  }

  createEmployee(value: EmployeeFormValue): Promise<Employee> {
    return firstValueFrom(this.http.post<Employee>(`${this.baseUrl}/employees`, value));
  }

  updateEmployee(id: string, value: EmployeeFormValue): Promise<Employee> {
    return firstValueFrom(this.http.put<Employee>(`${this.baseUrl}/employees/${id}`, value));
  }

  removeEmployee(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/employees/${id}`));
  }

  addLeave(employeeId: string, value: LeaveFormValue): Promise<LeaveRequest> {
    return firstValueFrom(this.http.post<LeaveRequest>(`${this.baseUrl}/employees/${employeeId}/leaves`, value));
  }

  setLeaveStatus(leaveId: string, status: LeaveStatus): Promise<LeaveRequest> {
    return firstValueFrom(this.http.patch<LeaveRequest>(`${this.baseUrl}/leaves/${leaveId}/status`, { status }));
  }

  removeLeave(leaveId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/leaves/${leaveId}`));
  }
}
