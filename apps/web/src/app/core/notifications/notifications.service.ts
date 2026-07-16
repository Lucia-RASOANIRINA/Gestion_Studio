import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";

export type NotificationType = "low_stock" | "overdue_invoice" | "maintenance_due";
export type NotificationSeverity = "info" | "warning" | "danger";

export interface AppNotification {
  type: NotificationType;
  severity: NotificationSeverity;
  entity: string;
  entityId: string;
  title: string;
  meta: number;
  date: string | null;
}

@Injectable({ providedIn: "root" })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/notifications`;

  readonly items = signal<AppNotification[]>([]);
  readonly count = signal(0);

  async refresh(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ items: AppNotification[]; count: number }>(this.baseUrl)
      );
      this.items.set(res.items);
      this.count.set(res.count);
    } catch {
      // silencieux : les notifications ne doivent pas casser l'application
    }
  }

  /** Lien de destination selon le type d'alerte. */
  routeFor(notification: AppNotification): string {
    switch (notification.type) {
      case "overdue_invoice":
        return `/billing/${notification.entityId}`;
      case "low_stock":
        return "/resources";
      case "maintenance_due":
        return `/resources/equipment/${notification.entityId}/edit`;
      default:
        return "/dashboard";
    }
  }
}
