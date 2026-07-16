import { DecimalPipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
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
    // eslint-disable-next-line no-alert
    if (!confirm(`${employee.firstName} ${employee.lastName}`)) return;
    await this.hr.removeEmployee(employee.id);
    await this.load();
  }

  typeBadgeClass(type: EmployeeType): string {
    return type === "FREELANCE" ? "bg-gs-violet/20 text-gs-violet" : "bg-gs-blue/20 text-gs-blue";
  }
}
