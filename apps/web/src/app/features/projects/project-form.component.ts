import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { resolveErrorMessageKey } from "../../shared/http-error.util";
import type { Client } from "../clients/client.model";
import { ClientsService } from "../clients/clients.service";
import {
  Currency,
  DEFAULT_CHECKLIST,
  PROJECT_STATUSES,
  PROJECT_TRANSITIONS,
  SERVICE_TYPES,
  type ChecklistItem,
  type ProjectStatus,
} from "./project.model";
import { ProjectsService } from "./projects.service";

@Component({
  selector: "gs-project-form",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, GsIconComponent],
  templateUrl: "./project-form.component.html",
})
export class ProjectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly projectsService = inject(ProjectsService);
  private readonly clientsService = inject(ClientsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly serviceTypes = SERVICE_TYPES;
  readonly currencies = [Currency.MGA, Currency.EUR, Currency.USD];
  readonly clients = signal<Client[]>([]);
  readonly saving = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly projectId = signal<string | null>(null);
  readonly currentStatus = signal<ProjectStatus | null>(null);
  readonly transitionError = signal<string | null>(null);

  readonly statuses = PROJECT_STATUSES;
  readonly checklist = signal<ChecklistItem[]>(DEFAULT_CHECKLIST.map((item) => ({ ...item })));

  readonly form = this.fb.nonNullable.group({
    title: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    clientId: ["", Validators.required],
    serviceType: [SERVICE_TYPES[0], Validators.required],
    description: [""],
    budgetAmount: [null as number | null],
    budgetCurrency: [Currency.MGA],
    startDate: [""],
    dueDate: [""],
    progress: [0],
  });

  get nextStatuses(): ProjectStatus[] {
    const status = this.currentStatus();
    return status ? PROJECT_TRANSITIONS[status] : [];
  }

  /** Index de l'étape courante dans la timeline des statuts. */
  get currentStatusIndex(): number {
    const status = this.currentStatus();
    return status ? PROJECT_STATUSES.indexOf(status) : -1;
  }

  toggleChecklistItem(index: number): void {
    this.checklist.update((items) =>
      items.map((item, i) => (i === index ? { ...item, done: !item.done } : item))
    );
  }

  async ngOnInit(): Promise<void> {
    try {
      const { items } = await this.clientsService.list({ pageSize: 100 });
      this.clients.set(items);
    } catch {
      this.serverError.set("common.errors.network");
    }

    const id = this.route.snapshot.paramMap.get("id");
    if (!id) return;

    this.projectId.set(id);
    try {
      await this.loadProject(id);
    } catch {
      await this.router.navigateByUrl("/projects");
    }
  }

  private async loadProject(id: string): Promise<void> {
    const project = await this.projectsService.getById(id);
    this.currentStatus.set(project.status);
    this.form.patchValue({
      title: project.title,
      clientId: project.client.id,
      serviceType: project.serviceType,
      description: project.description ?? "",
      budgetAmount: project.budgetAmount ? Number(project.budgetAmount) : null,
      budgetCurrency: project.budgetCurrency,
      startDate: project.startDate ? project.startDate.substring(0, 10) : "",
      dueDate: project.dueDate ? project.dueDate.substring(0, 10) : "",
      progress: project.progress ?? 0,
    });
    if (project.checklist && project.checklist.length > 0) {
      this.checklist.set(project.checklist.map((item) => ({ ...item })));
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.serverError.set(null);
    const raw = this.form.getRawValue();
    const value = {
      ...raw,
      budgetAmount: raw.budgetAmount ?? undefined,
      description: raw.description || undefined,
      startDate: raw.startDate || undefined,
      dueDate: raw.dueDate || undefined,
      progress: Number(raw.progress) || 0,
      checklist: this.checklist(),
    };

    try {
      if (this.projectId()) {
        await this.projectsService.update(this.projectId()!, value);
      } else {
        await this.projectsService.create(value);
      }
      await this.router.navigateByUrl("/projects");
    } catch (error) {
      this.serverError.set(resolveErrorMessageKey(error));
    } finally {
      this.saving.set(false);
    }
  }

  async transitionTo(status: ProjectStatus): Promise<void> {
    if (!this.projectId()) return;
    this.transitionError.set(null);
    try {
      const updated = await this.projectsService.transition(this.projectId()!, status);
      this.currentStatus.set(updated.status);
    } catch (error) {
      this.transitionError.set(resolveErrorMessageKey(error, { 403: "projects.form.transition_error" }));
    }
  }

  statusBadgeClass(status: string | null): string {
    const classes: Record<string, string> = {
      QUOTE: "bg-gs-hover text-gs-light/70",
      VALIDATED: "bg-gs-blue/20 text-gs-blue",
      IN_PROGRESS: "bg-gs-violet/20 text-gs-violet",
      REVIEW: "bg-gs-orange/20 text-gs-orange",
      DELIVERED: "bg-gs-green/20 text-gs-green",
      INVOICED: "bg-gs-green/20 text-gs-green",
      ARCHIVED: "bg-gs-hover text-gs-light/40",
    };
    return classes[status ?? "QUOTE"] ?? classes["QUOTE"];
  }
}
