import { DecimalPipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { StudiosService } from "./studios.service";
import type { Studio, StudioStatus } from "./studio.model";

@Component({
  selector: "gs-studios-list",
  standalone: true,
  imports: [RouterLink, DecimalPipe, TranslateModule, GsIconComponent],
  templateUrl: "./studios-list.component.html",
})
export class StudiosListComponent {
  private readonly studios = inject(StudiosService);
  private readonly translate = inject(TranslateService);

  readonly items = signal<Studio[]>([]);
  readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.studios.list();
      this.items.set(res.items);
    } finally {
      this.loading.set(false);
    }
  }

  async remove(studio: Studio): Promise<void> {
    // eslint-disable-next-line no-alert
    if (!confirm(studio.name)) return;
    await this.studios.remove(studio.id);
    await this.load();
  }

  statusBadgeClass(status: StudioStatus): string {
    const map: Record<StudioStatus, string> = {
      AVAILABLE: "bg-gs-green/15 text-gs-green",
      MAINTENANCE: "bg-gs-orange/15 text-gs-orange",
      CLOSED: "bg-gs-hover text-gs-light/50",
    };
    return map[status];
  }
}
