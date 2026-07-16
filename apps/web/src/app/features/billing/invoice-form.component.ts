import { DecimalPipe } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { ClientsService } from "../clients/clients.service";
import { ProjectsService } from "../projects/projects.service";
import type { Client } from "../clients/client.model";
import type { Project } from "../projects/project.model";
import { BillingService } from "./billing.service";
import type { InvoiceItem } from "./billing.model";

@Component({
  selector: "gs-invoice-form",
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe, TranslateModule, GsIconComponent],
  templateUrl: "./invoice-form.component.html",
})
export class InvoiceFormComponent {
  private readonly billing = inject(BillingService);
  private readonly clientsService = inject(ClientsService);
  private readonly projectsService = inject(ProjectsService);
  private readonly router = inject(Router);

  readonly clients = signal<Client[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly saving = signal(false);
  readonly error = signal(false);

  readonly clientId = signal("");
  readonly projectId = signal("");
  readonly taxRate = signal(20);
  readonly dueDate = signal("");
  readonly notes = signal("");
  readonly items = signal<InvoiceItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);

  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0)
  );
  readonly taxAmount = computed(() => Math.round((this.subtotal() * (Number(this.taxRate()) || 0)) / 100));
  readonly total = computed(() => this.subtotal() + this.taxAmount());

  readonly canSubmit = computed(
    () => this.clientId() !== "" && this.items().some((i) => i.description.trim() && i.unitPrice >= 0)
  );

  constructor() {
    void this.loadRefs();
  }

  private async loadRefs(): Promise<void> {
    const [clients, projects] = await Promise.all([
      this.clientsService.list({ pageSize: 100 }),
      this.projectsService.list({ pageSize: 100 }),
    ]);
    this.clients.set(clients.items);
    this.projects.set(projects.items);
  }

  addItem(): void {
    this.items.update((items) => [...items, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  removeItem(index: number): void {
    this.items.update((items) => (items.length > 1 ? items.filter((_, i) => i !== index) : items));
  }

  updateItem(index: number, field: keyof InvoiceItem, value: string): void {
    this.items.update((items) =>
      items.map((item, i) =>
        i === index
          ? { ...item, [field]: field === "description" ? value : Number(value) || 0 }
          : item
      )
    );
  }

  async submit(): Promise<void> {
    if (!this.canSubmit()) return;
    this.saving.set(true);
    this.error.set(false);
    try {
      const invoice = await this.billing.create({
        clientId: this.clientId(),
        projectId: this.projectId() || null,
        currency: "MGA",
        taxRate: Number(this.taxRate()) || 0,
        dueDate: this.dueDate() || null,
        notes: this.notes().trim() || null,
        items: this.items()
          .filter((i) => i.description.trim())
          .map((i) => ({
            description: i.description.trim(),
            quantity: Number(i.quantity) || 1,
            unitPrice: Number(i.unitPrice) || 0,
          })),
      });
      await this.router.navigate(["/billing", invoice.id]);
    } catch {
      this.error.set(true);
    } finally {
      this.saving.set(false);
    }
  }
}
