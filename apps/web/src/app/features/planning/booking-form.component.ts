import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import type { Project } from "../projects/project.model";
import { ProjectsService } from "../projects/projects.service";
import { toDateTimeLocalValue } from "./date-utils";
import { BOOKING_TYPES, STUDIO_ROOMS, type BookingEngineerRef } from "./planning.model";
import { PlanningService } from "./planning.service";

@Component({
  selector: "gs-booking-form",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, GsIconComponent],
  templateUrl: "./booking-form.component.html",
})
export class BookingFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly planningService = inject(PlanningService);
  private readonly projectsService = inject(ProjectsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly studios = STUDIO_ROOMS;
  readonly types = BOOKING_TYPES;
  readonly projects = signal<Project[]>([]);
  readonly engineers = signal<BookingEngineerRef[]>([]);
  readonly saving = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly bookingId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    studio: [this.studios[0], Validators.required],
    type: [this.types[0], Validators.required],
    title: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    startAt: ["", Validators.required],
    endAt: ["", Validators.required],
    projectId: [""],
    engineerId: [""],
    notes: [""],
  });

  async ngOnInit(): Promise<void> {
    const [{ items: projects }, engineers] = await Promise.all([
      this.projectsService.list({ pageSize: 100 }),
      this.planningService.listEngineers(),
    ]);
    this.projects.set(projects);
    this.engineers.set(engineers);

    const id = this.route.snapshot.paramMap.get("id");
    if (!id) {
      const now = new Date();
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      this.form.patchValue({
        startAt: toDateTimeLocalValue(now),
        endAt: toDateTimeLocalValue(end),
      });
      return;
    }

    this.bookingId.set(id);
    const booking = await this.planningService.getById(id);
    this.form.patchValue({
      studio: booking.studio,
      type: booking.type,
      title: booking.title,
      startAt: toDateTimeLocalValue(new Date(booking.startAt)),
      endAt: toDateTimeLocalValue(new Date(booking.endAt)),
      projectId: booking.project?.id ?? "",
      engineerId: booking.engineer?.id ?? "",
      notes: booking.notes ?? "",
    });
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
      studio: raw.studio,
      type: raw.type,
      title: raw.title,
      startAt: new Date(raw.startAt).toISOString(),
      endAt: new Date(raw.endAt).toISOString(),
      projectId: raw.projectId || undefined,
      engineerId: raw.engineerId || undefined,
      notes: raw.notes || undefined,
    };

    try {
      if (this.bookingId()) {
        await this.planningService.update(this.bookingId()!, value);
      } else {
        await this.planningService.create(value);
      }
      await this.router.navigateByUrl("/planning");
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.serverError.set("planning.form.conflict_error");
      } else if (error instanceof HttpErrorResponse && error.status === 400) {
        this.serverError.set("planning.form.validation_error");
      } else {
        this.serverError.set("planning.form.error");
      }
    } finally {
      this.saving.set(false);
    }
  }
}
