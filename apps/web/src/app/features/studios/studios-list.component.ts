import { DecimalPipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { DialogService } from "../../core/ui/dialog.service";
import { ToastService } from "../../core/ui/toast.service";
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
  private readonly dialog = inject(DialogService);
  private readonly toast = inject(ToastService);

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
    const confirmed = await this.dialog.confirm({
      title: this.translate.instant("common.dialog.delete_title"),
      message: this.translate.instant("common.dialog.delete_named", { name: studio.name }),
      confirmLabel: this.translate.instant("common.dialog.delete"),
      danger: true,
      icon: "delete",
    });
    if (!confirmed) return;
    await this.studios.remove(studio.id);
    this.toast.success(this.translate.instant("common.toast.deleted"));
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
