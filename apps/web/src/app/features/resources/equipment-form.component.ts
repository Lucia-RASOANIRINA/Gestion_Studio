import { DatePipe, DecimalPipe } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { resolveErrorMessageKey } from "../../shared/http-error.util";
import { STUDIO_ROOMS } from "../planning/planning.model";
import { EquipmentService } from "./equipment.service";
import { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES, type MaintenanceRecord } from "./resource.model";

@Component({
  selector: "gs-equipment-form",
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe, DecimalPipe, RouterLink, TranslateModule, GsIconComponent],
  templateUrl: "./equipment-form.component.html",
})
export class EquipmentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly equipmentService = inject(EquipmentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categories = EQUIPMENT_CATEGORIES;
  readonly statuses = EQUIPMENT_STATUSES;
  readonly studios = STUDIO_ROOMS;
  readonly saving = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly equipmentId = signal<string | null>(null);

  // Historique de maintenance (uniquement en édition).
  readonly maintenance = signal<MaintenanceRecord[]>([]);
  readonly mDescription = signal("");
  readonly mCost = signal<number | null>(null);
  readonly mTechnician = signal("");
  readonly mParts = signal("");
  readonly savingMaintenance = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    category: [this.categories[0], Validators.required],
    serialNumber: [""],
    brand: [""],
    model: [""],
    location: [""],
    status: [this.statuses[0], Validators.required],
    studio: [""],
    purchaseDate: [""],
    warrantyUntil: [""],
    purchasePrice: [null as number | null],
    currentValue: [null as number | null],
    photoUrl: [""],
    nextMaintenanceAt: [""],
    notes: [""],
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) return;

    this.equipmentId.set(id);
    try {
      const equipment = await this.equipmentService.getById(id);
      this.form.patchValue({
        name: equipment.name,
        category: equipment.category,
        serialNumber: equipment.serialNumber ?? "",
        brand: equipment.brand ?? "",
        model: equipment.model ?? "",
        location: equipment.location ?? "",
        status: equipment.status,
        studio: equipment.studio ?? "",
        purchaseDate: equipment.purchaseDate ? equipment.purchaseDate.substring(0, 10) : "",
        warrantyUntil: equipment.warrantyUntil ? equipment.warrantyUntil.substring(0, 10) : "",
        purchasePrice: equipment.purchasePrice ? Number(equipment.purchasePrice) : null,
        currentValue: equipment.currentValue ? Number(equipment.currentValue) : null,
        photoUrl: equipment.photoUrl ?? "",
        nextMaintenanceAt: equipment.nextMaintenanceAt ? equipment.nextMaintenanceAt.substring(0, 10) : "",
        notes: equipment.notes ?? "",
      });
      this.maintenance.set(equipment.maintenanceRecords ?? []);
    } catch {
      await this.router.navigateByUrl("/resources");
    }
  }

  async addMaintenance(): Promise<void> {
    const id = this.equipmentId();
    if (!id || this.mDescription().trim().length < 2) return;
    this.savingMaintenance.set(true);
    try {
      await this.equipmentService.addMaintenance(id, {
        description: this.mDescription().trim(),
        cost: this.mCost() ? Number(this.mCost()) : null,
        technician: this.mTechnician().trim() || undefined,
        partsReplaced: this.mParts().trim() || undefined,
      });
      this.maintenance.set(await this.equipmentService.listMaintenance(id));
      this.mDescription.set("");
      this.mCost.set(null);
      this.mTechnician.set("");
      this.mParts.set("");
    } finally {
      this.savingMaintenance.set(false);
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
      serialNumber: raw.serialNumber || undefined,
      brand: raw.brand || undefined,
      model: raw.model || undefined,
      location: raw.location || undefined,
      studio: (raw.studio || undefined) as (typeof this.studios)[number] | undefined,
      purchaseDate: raw.purchaseDate || undefined,
      warrantyUntil: raw.warrantyUntil || undefined,
      purchasePrice: raw.purchasePrice ?? undefined,
      currentValue: raw.currentValue ?? undefined,
      photoUrl: raw.photoUrl || undefined,
      nextMaintenanceAt: raw.nextMaintenanceAt || undefined,
      notes: raw.notes || undefined,
    };

    try {
      if (this.equipmentId()) {
        await this.equipmentService.update(this.equipmentId()!, value);
      } else {
        await this.equipmentService.create(value);
      }
      await this.router.navigateByUrl("/resources");
    } catch (error) {
      this.serverError.set(resolveErrorMessageKey(error));
    } finally {
      this.saving.set(false);
    }
  }
}
