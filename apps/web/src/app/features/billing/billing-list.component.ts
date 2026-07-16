import { DatePipe, DecimalPipe } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { BillingService } from "./billing.service";
import { INVOICE_STATUSES, type BillingSummary, type Invoice, type InvoiceStatus } from "./billing.model";

@Component({
  selector: "gs-billing-list",
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, TranslateModule, GsIconComponent],
  templateUrl: "./billing-list.component.html",
})
export class BillingListComponent {
  private readonly billing = inject(BillingService);

  readonly invoices = signal<Invoice[]>([]);
  readonly summary = signal<BillingSummary | null>(null);
  readonly loading = signal(true);
  readonly total = signal(0);

  readonly search = signal("");
  readonly status = signal<InvoiceStatus | "">("");
  readonly statuses = INVOICE_STATUSES;

  readonly kpis = computed(() => {
    const s = this.summary();
    return [
      { labelKey: "billing.kpi.invoiced", value: s?.invoiced ?? 0, accent: "text-gs-blue" },
      { labelKey: "billing.kpi.paid", value: s?.paid ?? 0, accent: "text-gs-green" },
      { labelKey: "billing.kpi.outstanding", value: s?.outstanding ?? 0, accent: "text-gs-violet" },
      { labelKey: "billing.kpi.overdue", value: s?.overdue ?? 0, accent: "text-gs-orange" },
    ];
  });

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [list, summary] = await Promise.all([
        this.billing.list({
          search: this.search().trim() || undefined,
          status: this.status() || undefined,
        }),
        this.billing.summary(),
      ]);
      this.invoices.set(list.items);
      this.total.set(list.total);
      this.summary.set(summary);
    } finally {
      this.loading.set(false);
    }
  }

  statusBadgeClass(status: InvoiceStatus): string {
    const map: Record<InvoiceStatus, string> = {
      DRAFT: "bg-gs-hover text-gs-light/70",
      SENT: "bg-gs-navy text-gs-blue",
      PARTIAL: "bg-gs-dark-violet/30 text-gs-violet",
      PAID: "bg-gs-green/15 text-gs-green",
      OVERDUE: "bg-gs-orange/15 text-gs-orange",
      CANCELLED: "bg-gs-hover text-gs-light/40 line-through",
    };
    return map[status];
  }
}
