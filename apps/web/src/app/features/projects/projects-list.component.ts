import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { resolveErrorMessageKey } from "../../shared/http-error.util";
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
    if (!confirm(`Supprimer ${project.reference} ?`)) return;
    try {
      await this.projectsService.remove(project.id);
      await this.load();
    } catch (error) {
      alert(this.translate.instant(resolveErrorMessageKey(error)));
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
