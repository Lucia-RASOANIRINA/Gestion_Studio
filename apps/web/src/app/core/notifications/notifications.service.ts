import { HttpClient } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import type { IconName } from "../../shared/icon/icon.component";

export type AlertType = "low_stock" | "overdue_invoice" | "maintenance_due";
export type NotificationSeverity = "info" | "warning" | "danger";

/** Alerte calculée (condition en cours : stock bas, retard, maintenance). */
export interface AppAlert {
  type: AlertType;
  severity: NotificationSeverity;
  entity: string;
  entityId: string;
  title: string;
  meta: number;
  date: string | null;
}

/** Notification persistante (événement du fil d'activité). */
export interface FeedNotification {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  actorId: string | null;
  actorName: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  items: FeedNotification[];
  unreadCount: number;
  alerts: AppAlert[];
  alertCount: number;
}

@Injectable({ providedIn: "root" })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);
  private readonly baseUrl = `${environment.apiBaseUrl}/notifications`;

  readonly items = signal<FeedNotification[]>([]);
  readonly unreadCount = signal(0);
  readonly alerts = signal<AppAlert[]>([]);

  /** Compteur affiché sur la cloche : non-lues + alertes en cours. */
  readonly badgeCount = computed(() => this.unreadCount() + this.alerts().length);

  async refresh(): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.get<NotificationsResponse>(this.baseUrl));
      this.items.set(res.items);
      this.unreadCount.set(res.unreadCount);
      this.alerts.set(res.alerts);
    } catch {
      // silencieux : les notifications ne doivent pas casser l'application
    }
  }

  async markRead(id: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${this.baseUrl}/${id}/read`, {}));
    this.items.update((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    this.unreadCount.update((c) => Math.max(0, c - 1));
  }

  async markAllRead(): Promise<void> {
    await firstValueFrom(this.http.post(`${this.baseUrl}/read-all`, {}));
    this.items.update((list) => list.map((n) => ({ ...n, isRead: true })));
    this.unreadCount.set(0);
  }

  /** Lien de destination d'une notification selon son entité. */
  routeForNotification(n: FeedNotification): string {
    if (!n.entityId) return "/dashboard";
    switch (n.entity) {
      case "Client":
        return `/clients/${n.entityId}/edit`;
      case "Project":
        return `/projects/${n.entityId}`;
      case "Booking":
        return "/planning";
      case "Invoice":
        return `/billing/${n.entityId}`;
      case "Equipment":
        return `/resources/equipment/${n.entityId}/edit`;
      case "Consumable":
        return "/resources";
      case "Expense":
        return "/billing/finance";
      case "Employee":
      case "LeaveRequest":
        return "/hr";
      default:
        return "/dashboard";
    }
  }

  /** Lien de destination d'une alerte calculée. */
  routeForAlert(alert: AppAlert): string {
    switch (alert.type) {
      case "overdue_invoice":
        return `/billing/${alert.entityId}`;
      case "low_stock":
        return "/resources";
      case "maintenance_due":
        return `/resources/equipment/${alert.entityId}/edit`;
      default:
        return "/dashboard";
    }
  }

  /** Libellé lisible « <entité> · <action> », traduit avec repli sur le brut. */
  label(n: FeedNotification): string {
    const verb = n.action.split(".").pop() ?? n.action;
    const entityKey = `audit.entity.${n.entity}`;
    const verbKey = `audit.verb.${verb}`;
    const entityLabel = this.translate.instant(entityKey);
    const verbLabel = this.translate.instant(verbKey);
    const entity = entityLabel === entityKey ? n.entity : entityLabel;
    const action = verbLabel === verbKey ? verb : verbLabel;
    return `${entity} · ${action}`;
  }

  iconForEntity(entity: string): IconName {
    const map: Record<string, IconName> = {
      Client: "clients",
      Project: "projects",
      Booking: "planning",
      Invoice: "billing",
      Equipment: "resources",
      Consumable: "resources",
      Expense: "billing",
      Employee: "user",
      LeaveRequest: "user",
      Studio: "studios",
      User: "user",
    };
    return map[entity] ?? "bell";
  }
}
