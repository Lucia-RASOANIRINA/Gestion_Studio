import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { PHONE_REGEX } from "@gestion-studio/shared";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { CLIENT_SEGMENTS, ClientSegment } from "./client.model";
import { ClientsService } from "./clients.service";

@Component({
  selector: "gs-client-form",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, GsIconComponent],
  templateUrl: "./client-form.component.html",
})
export class ClientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly segments = CLIENT_SEGMENTS;
  readonly saving = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly clientId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    segment: [ClientSegment.OTHER, Validators.required],
    email: ["", [Validators.email]],
    phone: ["", [Validators.pattern(PHONE_REGEX)]],
    address: [""],
    notes: [""],
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) return;

    this.clientId.set(id);
    const client = await this.clientsService.getById(id);
    this.form.patchValue({
      name: client.name,
      segment: client.segment,
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      notes: client.notes ?? "",
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.serverError.set(null);
    const value = this.form.getRawValue();

    try {
      if (this.clientId()) {
        await this.clientsService.update(this.clientId()!, value);
      } else {
        await this.clientsService.create(value);
      }
      await this.router.navigateByUrl("/clients");
    } catch {
      this.serverError.set("clients.form.error");
    } finally {
      this.saving.set(false);
    }
  }
}
