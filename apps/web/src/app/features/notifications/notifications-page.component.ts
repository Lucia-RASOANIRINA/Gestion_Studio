import { DatePipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { NotificationsService, type FeedNotification } from "../../core/notifications/notifications.service";

@Component({
  selector: "gs-notifications-page",
  standalone: true,
  imports: [DatePipe, RouterLink, TranslateModule, GsIconComponent],
  templateUrl: "./notifications-page.component.html",
})
export class NotificationsPageComponent {
  readonly notifications = inject(NotificationsService);

  constructor() {
    void this.notifications.refresh();
  }

  markRead(event: Event, n: FeedNotification): void {
    event.preventDefault();
    event.stopPropagation();
    if (!n.isRead) void this.notifications.markRead(n.id);
  }

  markAllRead(): void {
    void this.notifications.markAllRead();
  }
}
