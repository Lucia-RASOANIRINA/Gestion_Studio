import { DatePipe, DecimalPipe } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { GsIconComponent, type IconName } from "../../shared/icon/icon.component";
import { ReportingService } from "../reporting/reporting.service";
import type { RecentActivity, ReportingDashboard } from "../reporting/reporting.model";

interface KpiTile {
  labelKey: string;
  value: number;
  icon: IconName;
  accent: string;
  suffix?: "money" | "percent" | "days";
}

@Component({
  selector: "gs-dashboard",
  standalone: true,
  imports: [DatePipe, DecimalPipe, TranslateModule, GsIconComponent],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent {
  private readonly reporting = inject(ReportingService);
  private readonly translate = inject(TranslateService);

  readonly data = signal<ReportingDashboard | null>(null);
  readonly loading = signal(true);

  readonly kpis = computed<KpiTile[]>(() => {
    const d = this.data();
    if (!d) return [];
    const k = d.kpis;
    return [
      { labelKey: "dashboard.kpi.projects_in_progress", value: k.projectsInProgress, icon: "projects", accent: "text-gs-blue" },
      { labelKey: "dashboard.kpi.projects_completed", value: k.projectsCompleted, icon: "check", accent: "text-gs-green" },
      { labelKey: "dashboard.kpi.revenue_month", value: k.revenueThisMonth, icon: "billing", accent: "text-gs-green", suffix: "money" },
      { labelKey: "dashboard.kpi.revenue_year", value: k.revenueThisYear, icon: "billing", accent: "text-gs-blue", suffix: "money" },
      { labelKey: "dashboard.kpi.new_clients", value: k.newClientsThisMonth, icon: "clients", accent: "text-gs-violet" },
      { labelKey: "dashboard.kpi.occupancy", value: k.occupancyRate, icon: "planning", accent: "text-gs-blue", suffix: "percent" },
      { labelKey: "dashboard.kpi.avg_duration", value: k.avgProjectDurationDays, icon: "projects", accent: "text-gs-blue", suffix: "days" },
      { labelKey: "dashboard.kpi.bookings_today", value: k.bookingsToday, icon: "planning", accent: "text-gs-blue" },
      { labelKey: "dashboard.kpi.bookings_week", value: k.bookingsThisWeek, icon: "planning", accent: "text-gs-blue" },
      { labelKey: "dashboard.kpi.outstanding", value: k.outstanding, icon: "billing", accent: "text-gs-orange", suffix: "money" },
      { labelKey: "dashboard.kpi.clients_total", value: k.clients, icon: "clients", accent: "text-gs-blue" },
      { labelKey: "dashboard.kpi.low_stock", value: k.lowStockCount, icon: "alert", accent: "text-gs-orange" },
    ];
  });

  readonly maxRevenue = computed(() => this.max(this.data()?.revenueByMonth.map((m) => m.amount)));
  readonly maxBookings = computed(() => this.max(this.data()?.bookingsByMonth.map((m) => m.count)));
  readonly maxNewClients = computed(() => this.max(this.data()?.newClientsByMonth.map((m) => m.count)));
  readonly maxService = computed(() => this.max(this.data()?.servicesMostRequested.map((s) => s.count)));
  readonly maxRevenueService = computed(() => this.max(this.data()?.revenueByService.map((s) => s.amount)));
  readonly maxTopClient = computed(() => this.max(this.data()?.topClients.map((c) => c.amount)));

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.data.set(await this.reporting.dashboard());
    } catch {
      // laisse le tableau de bord vide en cas d'erreur/permission manquante
    } finally {
      this.loading.set(false);
    }
  }

  private max(values?: number[]): number {
    return Math.max(1, ...(values ?? [0]));
  }

  barWidth(value: number, max: number): string {
    return `${Math.round((value / max) * 100)}%`;
  }

  /** Icône associée à une entrée du journal d'audit selon son entité. */
  activityIcon(entity: string): IconName {
    const map: Record<string, IconName> = {
      Client: "clients",
      Project: "projects",
      Booking: "planning",
      Invoice: "billing",
      Equipment: "resources",
      Consumable: "resources",
      User: "user",
    };
    return map[entity] ?? "settings";
  }

  /** Libellé lisible d'une activité : « <entité> · <action> », traduit avec repli. */
  activityLabel(activity: RecentActivity): string {
    const verb = activity.action.split(".").pop() ?? activity.action;
    const entityKey = `audit.entity.${activity.entity}`;
    const verbKey = `audit.verb.${verb}`;
    const entityLabel = this.translate.instant(entityKey);
    const verbLabel = this.translate.instant(verbKey);
    const entity = entityLabel === entityKey ? activity.entity : entityLabel;
    const action = verbLabel === verbKey ? verb : verbLabel;
    return `${entity} · ${action}`;
  }
}
