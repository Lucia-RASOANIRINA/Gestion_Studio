import { DatePipe, DecimalPipe } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { DialogService } from "../../core/ui/dialog.service";
import { ToastService } from "../../core/ui/toast.service";
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
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(DialogService);
  private readonly toast = inject(ToastService);

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
      this.toast.success(this.translate.instant("finance.added"));
      await this.load();
    } finally {
      this.saving.set(false);
    }
  }

  async removeExpense(expense: Expense): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: this.translate.instant("common.dialog.delete_title"),
      message: this.translate.instant("common.dialog.delete_named", { name: expense.label }),
      confirmLabel: this.translate.instant("common.dialog.delete"),
      danger: true,
      icon: "delete",
    });
    if (!confirmed) return;
    await this.finance.removeExpense(expense.id);
    this.toast.success(this.translate.instant("common.toast.deleted"));
    await this.load();
  }

  barWidth(value: number, max: number): string {
    return `${Math.round((value / max) * 100)}%`;
  }
}
