import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { resolveErrorMessageKey } from "../../shared/http-error.util";
import { DialogService } from "../../core/ui/dialog.service";
import { ToastService } from "../../core/ui/toast.service";
import { ConsumableService } from "./consumable.service";
import { EquipmentService } from "./equipment.service";
import { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES, type Consumable, type Equipment } from "./resource.model";

type Tab = "equipment" | "consumables";

@Component({
  selector: "gs-resources",
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule, GsIconComponent],
  templateUrl: "./resources.component.html",
})
export class ResourcesComponent implements OnInit {
  private readonly equipmentService = inject(EquipmentService);
  private readonly consumableService = inject(ConsumableService);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(DialogService);
  private readonly toast = inject(ToastService);

  private async confirmDelete(name: string): Promise<boolean> {
    return this.dialog.confirm({
      title: this.translate.instant("common.dialog.delete_title"),
      message: this.translate.instant("common.dialog.delete_named", { name }),
      confirmLabel: this.translate.instant("common.dialog.delete"),
      danger: true,
      icon: "delete",
    });
  }

  readonly categories = EQUIPMENT_CATEGORIES;
  readonly statuses = EQUIPMENT_STATUSES;

  readonly tab = signal<Tab>("equipment");
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly equipment = signal<Equipment[]>([]);
  readonly equipmentTotal = signal(0);
  readonly equipmentSearch = signal("");
  readonly categoryFilter = signal("");
  readonly statusFilter = signal("");

  readonly consumables = signal<Consumable[]>([]);
  readonly consumablesTotal = signal(0);
  readonly consumableSearch = signal("");
  readonly lowStockOnly = signal(false);

  ngOnInit(): void {
    void this.loadEquipment();
    void this.loadConsumables();
  }

  setTab(tab: Tab): void {
    this.tab.set(tab);
  }

  async loadEquipment(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await this.equipmentService.list({
        search: this.equipmentSearch() || undefined,
        category: this.categoryFilter() || undefined,
        status: this.statusFilter() || undefined,
      });
      this.equipment.set(result.items);
      this.equipmentTotal.set(result.total);
    } catch (error) {
      this.error.set(resolveErrorMessageKey(error));
    } finally {
      this.loading.set(false);
    }
  }

  async loadConsumables(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await this.consumableService.list({
        search: this.consumableSearch() || undefined,
        lowStockOnly: this.lowStockOnly() || undefined,
      });
      this.consumables.set(result.items);
      this.consumablesTotal.set(result.total);
    } catch (error) {
      this.error.set(resolveErrorMessageKey(error));
    } finally {
      this.loading.set(false);
    }
  }

  async removeEquipment(item: Equipment): Promise<void> {
    if (!(await this.confirmDelete(item.name))) return;
    try {
      await this.equipmentService.remove(item.id);
      this.toast.success(this.translate.instant("common.toast.deleted"));
      await this.loadEquipment();
    } catch (error) {
      this.toast.error(this.translate.instant(resolveErrorMessageKey(error)));
    }
  }

  async removeConsumable(item: Consumable): Promise<void> {
    if (!(await this.confirmDelete(item.name))) return;
    try {
      await this.consumableService.remove(item.id);
      this.toast.success(this.translate.instant("common.toast.deleted"));
      await this.loadConsumables();
    } catch (error) {
      this.toast.error(this.translate.instant(resolveErrorMessageKey(error)));
    }
  }

  async adjustStock(item: Consumable, delta: number): Promise<void> {
    try {
      await this.consumableService.adjust(item.id, delta);
      await this.loadConsumables();
    } catch (error) {
      this.toast.error(this.translate.instant(resolveErrorMessageKey(error, { 400: "resources.consumables.adjust_error" })));
    }
  }

  statusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      AVAILABLE: "bg-gs-green/20 text-gs-green",
      IN_USE: "bg-gs-blue/20 text-gs-blue",
      MAINTENANCE: "bg-gs-orange/20 text-gs-orange",
      RETIRED: "bg-gs-hover text-gs-light/40",
    };
    return classes[status] ?? classes["AVAILABLE"];
  }
}
