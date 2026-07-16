import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { resolveErrorMessageKey } from "../../shared/http-error.util";
import { ConsumableService } from "./consumable.service";

@Component({
  selector: "gs-consumable-form",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, GsIconComponent],
  templateUrl: "./consumable-form.component.html",
})
export class ConsumableFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly consumableService = inject(ConsumableService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly consumableId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    unit: ["unité", [Validators.required, Validators.maxLength(50)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [10, [Validators.required, Validators.min(0)]],
    notes: [""],
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) return;

    this.consumableId.set(id);
    try {
      const consumable = await this.consumableService.getById(id);
      this.form.patchValue({
        name: consumable.name,
        unit: consumable.unit,
        quantity: consumable.quantity,
        lowStockThreshold: consumable.lowStockThreshold,
        notes: consumable.notes ?? "",
      });
    } catch {
      await this.router.navigateByUrl("/resources");
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
    const value = { ...raw, notes: raw.notes || undefined };

    try {
      if (this.consumableId()) {
        await this.consumableService.update(this.consumableId()!, value);
      } else {
        await this.consumableService.create(value);
      }
      await this.router.navigateByUrl("/resources");
    } catch (error) {
      this.serverError.set(resolveErrorMessageKey(error));
    } finally {
      this.saving.set(false);
    }
  }
}
