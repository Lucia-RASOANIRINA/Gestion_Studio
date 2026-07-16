import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import type {
  AddPaymentValue,
  BillingSummary,
  CreateInvoiceValue,
  Invoice,
  InvoiceListResponse,
  InvoiceStatus,
} from "./billing.model";

interface ListInvoicesParams {
  search?: string;
  status?: string;
  clientId?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: "root" })
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/billing`;

  list(params: ListInvoicesParams = {}): Promise<InvoiceListResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set("search", params.search);
    if (params.status) httpParams = httpParams.set("status", params.status);
    if (params.clientId) httpParams = httpParams.set("clientId", params.clientId);
    httpParams = httpParams.set("page", params.page ?? 1);
    httpParams = httpParams.set("pageSize", params.pageSize ?? 50);
    return firstValueFrom(this.http.get<InvoiceListResponse>(this.baseUrl, { params: httpParams }));
  }

  summary(): Promise<BillingSummary> {
    return firstValueFrom(this.http.get<BillingSummary>(`${this.baseUrl}/summary`));
  }

  getById(id: string): Promise<Invoice> {
    return firstValueFrom(this.http.get<Invoice>(`${this.baseUrl}/${id}`));
  }

  create(value: CreateInvoiceValue): Promise<Invoice> {
    return firstValueFrom(this.http.post<Invoice>(this.baseUrl, value));
  }

  updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    return firstValueFrom(this.http.patch<Invoice>(`${this.baseUrl}/${id}/status`, { status }));
  }

  addPayment(id: string, value: AddPaymentValue): Promise<Invoice> {
    return firstValueFrom(this.http.post<Invoice>(`${this.baseUrl}/${id}/payments`, value));
  }

  signInvoice(id: string, signatureDataUrl: string, signedBy: string): Promise<Invoice> {
    return firstValueFrom(
      this.http.post<Invoice>(`${this.baseUrl}/${id}/sign`, { signatureDataUrl, signedBy })
    );
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
