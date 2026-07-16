import { DatePipe, DecimalPipe } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { FinanceService } from "./finance.service";
import {
  EXPENSE_CATEGORIES,
  type Expense,
  type ExpenseCategory,
  type Treasury,
} from "./finance.model";

@Component({
  selector: "gs-finance",
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, TranslateModule, GsIconComponent],
  templateUrl: "./finance.component.html",
})
export class FinanceComponent {
  private readonly finance = inject(FinanceService);

  readonly treasury = signal<Treasury | null>(null);
  readonly expenses = signal<Expense[]>([]);
  readonly loading = signal(true);
  readonly categories = EXPENSE_CATEGORIES;

  // Formulaire de nouvelle dépense.
  readonly newLabel = signal("");
  readonly newCategory = signal<ExpenseCategory>("OTHER");
  readonly newAmount = signal<number | null>(null);
  readonly saving = signal(false);

  readonly maxCashflow = computed(() => {
    const t = this.treasury();
    if (!t) return 1;
    return Math.max(1, ...t.cashflowByMonth.flatMap((m) => [m.inflow, m.outflow]));
  });
  readonly maxCategory = computed(() =>
    Math.max(1, ...(this.treasury()?.expensesByCategory.map((c) => c.amount) ?? [0]))
  );

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [treasury, expenses] = await Promise.all([
        this.finance.treasury(),
        this.finance.listExpenses(),
      ]);
      this.treasury.set(treasury);
      this.expenses.set(expenses.items);
    } finally {
      this.loading.set(false);
    }
  }

  async addExpense(): Promise<void> {
    const amount = Number(this.newAmount());
    if (!this.newLabel().trim() || !amount || amount <= 0) return;
    this.saving.set(true);
    try {
      await this.finance.createExpense({
        label: this.newLabel().trim(),
        category: this.newCategory(),
        amount,
      });
      this.newLabel.set("");
      this.newAmount.set(null);
      this.newCategory.set("OTHER");
      await this.load();
    } finally {
      this.saving.set(false);
    }
  }

  async removeExpense(expense: Expense): Promise<void> {
    // eslint-disable-next-line no-alert
    if (!confirm(expense.label)) return;
    await this.finance.removeExpense(expense.id);
    await this.load();
  }

  barWidth(value: number, max: number): string {
    return `${Math.round((value / max) * 100)}%`;
  }
}
