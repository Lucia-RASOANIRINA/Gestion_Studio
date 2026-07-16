import { Component, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { HrService } from "./hr.service";
import {
  EMPLOYEE_STATUSES,
  EMPLOYEE_TYPES,
  LEAVE_TYPES,
  type EmployeeStatus,
  type EmployeeType,
  type LeaveRequest,
  type LeaveStatus,
  type LeaveType,
} from "./hr.model";

@Component({
  selector: "gs-employee-form",
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink, TranslateModule, GsIconComponent],
  templateUrl: "./employee-form.component.html",
})
export class EmployeeFormComponent {
  private readonly hr = inject(HrService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly types = EMPLOYEE_TYPES;
  readonly statuses = EMPLOYEE_STATUSES;
  readonly leaveTypes = LEAVE_TYPES;
  readonly employeeId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal(false);

  readonly firstName = signal("");
  readonly lastName = signal("");
  readonly position = signal("");
  readonly type = signal<EmployeeType>("EMPLOYEE");
  readonly email = signal("");
  readonly phone = signal("");
  readonly hireDate = signal("");
  readonly dailyRate = signal<number | null>(null);
  readonly status = signal<EmployeeStatus>("ACTIVE");

  // Congés / absences.
  readonly leaves = signal<LeaveRequest[]>([]);
  readonly lType = signal<LeaveType>("LEAVE");
  readonly lStart = signal("");
  readonly lEnd = signal("");
  readonly lReason = signal("");
  readonly savingLeave = signal(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.employeeId.set(id);
      void this.load(id);
    }
  }

  private async load(id: string): Promise<void> {
    try {
      const e = await this.hr.getEmployee(id);
      this.firstName.set(e.firstName);
      this.lastName.set(e.lastName);
      this.position.set(e.position);
      this.type.set(e.type);
      this.email.set(e.email ?? "");
      this.phone.set(e.phone ?? "");
      this.hireDate.set(e.hireDate ? e.hireDate.substring(0, 10) : "");
      this.dailyRate.set(e.dailyRate ? Number(e.dailyRate) : null);
      this.status.set(e.status);
      this.leaves.set(e.leaveRequests ?? []);
    } catch {
      await this.router.navigate(["/hr"]);
    }
  }

  async submit(): Promise<void> {
    if (this.firstName().trim() === "" || this.position().trim().length < 2) return;
    this.saving.set(true);
    this.error.set(false);
    const value = {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      position: this.position().trim(),
      type: this.type(),
      email: this.email().trim() || undefined,
      phone: this.phone().trim() || undefined,
      hireDate: this.hireDate() || undefined,
      dailyRate: this.dailyRate() ? Number(this.dailyRate()) : null,
      status: this.status(),
    };
    try {
      if (this.employeeId()) {
        await this.hr.updateEmployee(this.employeeId()!, value);
      } else {
        const created = await this.hr.createEmployee(value);
        this.employeeId.set(created.id);
        await this.router.navigate(["/hr", created.id, "edit"]);
        return;
      }
      await this.router.navigate(["/hr"]);
    } catch {
      this.error.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  async addLeave(): Promise<void> {
    const id = this.employeeId();
    if (!id || !this.lStart() || !this.lEnd()) return;
    this.savingLeave.set(true);
    try {
      await this.hr.addLeave(id, {
        type: this.lType(),
        startDate: this.lStart(),
        endDate: this.lEnd(),
        status: "PENDING",
        reason: this.lReason().trim() || undefined,
      });
      const e = await this.hr.getEmployee(id);
      this.leaves.set(e.leaveRequests ?? []);
      this.lStart.set("");
      this.lEnd.set("");
      this.lReason.set("");
    } finally {
      this.savingLeave.set(false);
    }
  }

  async setLeaveStatus(leave: LeaveRequest, status: LeaveStatus): Promise<void> {
    const updated = await this.hr.setLeaveStatus(leave.id, status);
    this.leaves.update((list) => list.map((l) => (l.id === updated.id ? updated : l)));
  }

  leaveStatusClass(status: LeaveStatus): string {
    const map: Record<LeaveStatus, string> = {
      PENDING: "bg-gs-hover text-gs-light/70",
      APPROVED: "bg-gs-green/15 text-gs-green",
      REJECTED: "bg-gs-orange/15 text-gs-orange",
    };
    return map[status];
  }
}
