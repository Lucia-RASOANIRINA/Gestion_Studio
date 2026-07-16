import { DecimalPipe } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent, type IconName } from "../../shared/icon/icon.component";
import { ReportingService } from "./reporting.service";
import type { ReportingDashboard } from "./reporting.model";

interface StatTile {
  labelKey: string;
  value: number;
  icon: IconName;
  accent: string;
  isMoney?: boolean;
}

@Component({
  selector: "gs-reporting",
  standalone: true,
  imports: [DecimalPipe, TranslateModule, GsIconComponent],
  templateUrl: "./reporting.component.html",
})
export class ReportingComponent {
  private readonly reporting = inject(ReportingService);

  readonly data = signal<ReportingDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly tiles = computed<StatTile[]>(() => {
    const d = this.data();
    if (!d) return [];
    return [
      { labelKey: "reporting.tiles.invoiced", value: d.kpis.invoiced, icon: "billing", accent: "text-gs-blue", isMoney: true },
      { labelKey: "reporting.tiles.paid", value: d.kpis.paid, icon: "check", accent: "text-gs-green", isMoney: true },
      { labelKey: "reporting.tiles.outstanding", value: d.kpis.outstanding, icon: "billing", accent: "text-gs-violet", isMoney: true },
      { labelKey: "reporting.tiles.clients", value: d.kpis.clients, icon: "clients", accent: "text-gs-blue" },
      { labelKey: "reporting.tiles.projects", value: d.kpis.projects, icon: "projects", accent: "text-gs-blue" },
      { labelKey: "reporting.tiles.bookings", value: d.kpis.upcomingBookings, icon: "planning", accent: "text-gs-blue" },
      { labelKey: "reporting.tiles.low_stock", value: d.kpis.lowStockCount, icon: "alert", accent: "text-gs-orange" },
    ];
  });

  readonly maxRevenue = computed(() =>
    Math.max(1, ...(this.data()?.revenueByMonth.map((m) => m.amount) ?? [0]))
  );
  readonly maxProjectCount = computed(() =>
    Math.max(1, ...(this.data()?.projectsByStatus.map((p) => p.count) ?? [0]))
  );
  readonly maxClientAmount = computed(() =>
    Math.max(1, ...(this.data()?.topClients.map((c) => c.amount) ?? [0]))
  );

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.data.set(await this.reporting.dashboard());
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  barWidth(value: number, max: number): string {
    return `${Math.round((value / max) * 100)}%`;
  }
}
