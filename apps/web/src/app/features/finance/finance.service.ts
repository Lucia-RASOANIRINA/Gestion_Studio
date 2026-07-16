import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import type { CreateExpenseValue, Expense, ExpenseListResponse, Treasury } from "./finance.model";

@Injectable({ providedIn: "root" })
export class FinanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/finance`;

  treasury(): Promise<Treasury> {
    return firstValueFrom(this.http.get<Treasury>(`${this.baseUrl}/treasury`));
  }

  listExpenses(params: { category?: string } = {}): Promise<ExpenseListResponse> {
    let httpParams = new HttpParams().set("pageSize", 100);
    if (params.category) httpParams = httpParams.set("category", params.category);
    return firstValueFrom(
      this.http.get<ExpenseListResponse>(`${this.baseUrl}/expenses`, { params: httpParams })
    );
  }

  createExpense(value: CreateExpenseValue): Promise<Expense> {
    return firstValueFrom(this.http.post<Expense>(`${this.baseUrl}/expenses`, value));
  }

  removeExpense(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/expenses/${id}`));
  }
}
