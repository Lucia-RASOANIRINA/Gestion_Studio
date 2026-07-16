import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { StudiosService } from "./studios.service";
import { STUDIO_STATUSES, STUDIO_TYPES, type StudioStatus, type StudioType } from "./studio.model";

@Component({
  selector: "gs-studio-form",
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule, GsIconComponent],
  templateUrl: "./studio-form.component.html",
})
export class StudioFormComponent {
  private readonly studios = inject(StudiosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly types = STUDIO_TYPES;
  readonly statuses = STUDIO_STATUSES;
  readonly studioId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal(false);

  readonly name = signal("");
  readonly type = signal<StudioType>("RECORDING");
  readonly capacity = signal(1);
  readonly hourlyPrice = signal<number | null>(null);
  readonly status = signal<StudioStatus>("AVAILABLE");
  readonly description = signal("");
  readonly equipmentSummary = signal("");
  readonly photoUrl = signal("");
  readonly notes = signal("");

  constructor() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.studioId.set(id);
      void this.loadStudio(id);
    }
  }

  private async loadStudio(id: string): Promise<void> {
    try {
      const s = await this.studios.getById(id);
      this.name.set(s.name);
      this.type.set(s.type);
      this.capacity.set(s.capacity);
      this.hourlyPrice.set(s.hourlyPrice ? Number(s.hourlyPrice) : null);
      this.status.set(s.status);
      this.description.set(s.description ?? "");
      this.equipmentSummary.set(s.equipmentSummary ?? "");
      this.photoUrl.set(s.photoUrl ?? "");
      this.notes.set(s.notes ?? "");
    } catch {
      await this.router.navigate(["/studios"]);
    }
  }

  async submit(): Promise<void> {
    if (this.name().trim().length < 2) return;
    this.saving.set(true);
    this.error.set(false);
    const value = {
      name: this.name().trim(),
      type: this.type(),
      capacity: Number(this.capacity()) || 1,
      hourlyPrice: this.hourlyPrice() ? Number(this.hourlyPrice()) : null,
      status: this.status(),
      description: this.description().trim() || null,
      equipmentSummary: this.equipmentSummary().trim() || null,
      photoUrl: this.photoUrl().trim() || null,
      notes: this.notes().trim() || null,
    };
    try {
      if (this.studioId()) {
        await this.studios.update(this.studioId()!, value);
      } else {
        await this.studios.create(value);
      }
      await this.router.navigate(["/studios"]);
    } catch {
      this.error.set(true);
    } finally {
      this.saving.set(false);
    }
  }
}
