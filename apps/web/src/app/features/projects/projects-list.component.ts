import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { resolveErrorMessageKey } from "../../shared/http-error.util";
import { DialogService } from "../../core/ui/dialog.service";
import { ToastService } from "../../core/ui/toast.service";
import { PROJECT_STATUSES, type Project } from "./project.model";
import { ProjectsService } from "./projects.service";

@Component({
  selector: "gs-projects-list",
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule, GsIconComponent],
  templateUrl: "./projects-list.component.html",
})
export class ProjectsListComponent implements OnInit {
  private readonly projectsService = inject(ProjectsService);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(DialogService);
  private readonly toast = inject(ToastService);

  readonly statuses = PROJECT_STATUSES;
  readonly projects = signal<Project[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly search = signal("");
  readonly statusFilter = signal("");
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await this.projectsService.list({
        search: this.search() || undefined,
        status: this.statusFilter() || undefined,
        pageSize: 50,
      });
      this.projects.set(result.items);
      this.total.set(result.total);
    } catch (error) {
      this.error.set(resolveErrorMessageKey(error));
    } finally {
      this.loading.set(false);
    }
  }

  async remove(project: Project): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: this.translate.instant("common.dialog.delete_title"),
      message: this.translate.instant("common.dialog.delete_named", { name: project.reference }),
      confirmLabel: this.translate.instant("common.dialog.delete"),
      danger: true,
      icon: "delete",
    });
    if (!confirmed) return;
    try {
      await this.projectsService.remove(project.id);
      this.toast.success(this.translate.instant("common.toast.deleted"));
      await this.load();
    } catch (error) {
      this.toast.error(this.translate.instant(resolveErrorMessageKey(error)));
    }
  }

  statusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      QUOTE: "bg-gs-hover text-gs-light/70",
      VALIDATED: "bg-gs-blue/20 text-gs-blue",
      IN_PROGRESS: "bg-gs-violet/20 text-gs-violet",
      REVIEW: "bg-gs-orange/20 text-gs-orange",
      DELIVERED: "bg-gs-green/20 text-gs-green",
      INVOICED: "bg-gs-green/20 text-gs-green",
      ARCHIVED: "bg-gs-hover text-gs-light/40",
    };
    return classes[status] ?? classes["QUOTE"];
  }
}
