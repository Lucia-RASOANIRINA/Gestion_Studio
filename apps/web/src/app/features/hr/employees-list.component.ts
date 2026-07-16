import { DecimalPipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { DialogService } from "../../core/ui/dialog.service";
import { ToastService } from "../../core/ui/toast.service";
import { HrService } from "./hr.service";
import type { Employee, EmployeeType } from "./hr.model";

@Component({
  selector: "gs-employees-list",
  standalone: true,
  imports: [RouterLink, DecimalPipe, TranslateModule, GsIconComponent],
  templateUrl: "./employees-list.component.html",
})
export class EmployeesListComponent {
  private readonly hr = inject(HrService);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(DialogService);
  private readonly toast = inject(ToastService);

  readonly items = signal<Employee[]>([]);
  readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.hr.listEmployees();
      this.items.set(res.items);
    } finally {
      this.loading.set(false);
    }
  }

  async remove(employee: Employee): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: this.translate.instant("common.dialog.delete_title"),
      message: this.translate.instant("common.dialog.delete_named", {
        name: `${employee.firstName} ${employee.lastName}`,
      }),
      confirmLabel: this.translate.instant("common.dialog.delete"),
      danger: true,
      icon: "delete",
    });
    if (!confirmed) return;
    await this.hr.removeEmployee(employee.id);
    this.toast.success(this.translate.instant("common.toast.deleted"));
    await this.load();
  }

  typeBadgeClass(type: EmployeeType): string {
    return type === "FREELANCE" ? "bg-gs-violet/20 text-gs-violet" : "bg-gs-blue/20 text-gs-blue";
  }
}
