import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
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

  readonly statuses = PROJECT_STATUSES;
  readonly projects = signal<Project[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly search = signal("");
  readonly statusFilter = signal("");

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.projectsService.list({
        search: this.search() || undefined,
        status: this.statusFilter() || undefined,
        pageSize: 50,
      });
      this.projects.set(result.items);
      this.total.set(result.total);
    } finally {
      this.loading.set(false);
    }
  }

  async remove(project: Project): Promise<void> {
    if (!confirm(`Supprimer ${project.reference} ?`)) return;
    await this.projectsService.remove(project.id);
    await this.load();
  }

  statusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      QUOTE: "bg-white/10 text-gs-light/70",
      VALIDATED: "bg-gs-blue/20 text-gs-blue",
      IN_PROGRESS: "bg-gs-violet/20 text-gs-violet",
      REVIEW: "bg-gs-orange/20 text-gs-orange",
      DELIVERED: "bg-gs-green/20 text-gs-green",
      INVOICED: "bg-gs-green/20 text-gs-green",
      ARCHIVED: "bg-white/5 text-gs-light/40",
    };
    return classes[status] ?? classes["QUOTE"];
  }
}
