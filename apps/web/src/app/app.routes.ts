import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { ShellComponent } from "./shared/layout/shell.component";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./features/auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "",
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: "", pathMatch: "full", redirectTo: "dashboard" },
      {
        path: "dashboard",
        loadComponent: () => import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
      },
      {
        path: "clients",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./features/clients/clients-list.component").then((m) => m.ClientsListComponent),
          },
          {
            path: "new",
            loadComponent: () =>
              import("./features/clients/client-form.component").then((m) => m.ClientFormComponent),
          },
          {
            path: ":id/edit",
            loadComponent: () =>
              import("./features/clients/client-form.component").then((m) => m.ClientFormComponent),
          },
        ],
      },
      {
        path: "projects",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./features/projects/projects-list.component").then((m) => m.ProjectsListComponent),
          },
          {
            path: "new",
            loadComponent: () =>
              import("./features/projects/project-form.component").then((m) => m.ProjectFormComponent),
          },
          {
            path: ":id",
            loadComponent: () =>
              import("./features/projects/project-form.component").then((m) => m.ProjectFormComponent),
          },
        ],
      },
      {
        path: "planning",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./features/planning/planning.component").then((m) => m.PlanningComponent),
          },
          {
            path: "new",
            loadComponent: () =>
              import("./features/planning/booking-form.component").then((m) => m.BookingFormComponent),
          },
          {
            path: ":id",
            loadComponent: () =>
              import("./features/planning/booking-form.component").then((m) => m.BookingFormComponent),
          },
        ],
      },
      {
        path: "resources",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./features/resources/resources.component").then((m) => m.ResourcesComponent),
          },
          {
            path: "equipment/new",
            loadComponent: () =>
              import("./features/resources/equipment-form.component").then((m) => m.EquipmentFormComponent),
          },
          {
            path: "equipment/:id/edit",
            loadComponent: () =>
              import("./features/resources/equipment-form.component").then((m) => m.EquipmentFormComponent),
          },
          {
            path: "consumables/new",
            loadComponent: () =>
              import("./features/resources/consumable-form.component").then((m) => m.ConsumableFormComponent),
          },
          {
            path: "consumables/:id/edit",
            loadComponent: () =>
              import("./features/resources/consumable-form.component").then((m) => m.ConsumableFormComponent),
          },
        ],
      },
      {
        path: "studios",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./features/studios/studios-list.component").then((m) => m.StudiosListComponent),
          },
          {
            path: "new",
            loadComponent: () =>
              import("./features/studios/studio-form.component").then((m) => m.StudioFormComponent),
          },
          {
            path: ":id/edit",
            loadComponent: () =>
              import("./features/studios/studio-form.component").then((m) => m.StudioFormComponent),
          },
        ],
      },
      {
        path: "hr",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./features/hr/employees-list.component").then((m) => m.EmployeesListComponent),
          },
          {
            path: "new",
            loadComponent: () =>
              import("./features/hr/employee-form.component").then((m) => m.EmployeeFormComponent),
          },
          {
            path: ":id/edit",
            loadComponent: () =>
              import("./features/hr/employee-form.component").then((m) => m.EmployeeFormComponent),
          },
        ],
      },
      {
        path: "billing",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./features/billing/billing-list.component").then((m) => m.BillingListComponent),
          },
          {
            path: "new",
            loadComponent: () =>
              import("./features/billing/invoice-form.component").then((m) => m.InvoiceFormComponent),
          },
          {
            path: "finance",
            loadComponent: () =>
              import("./features/finance/finance.component").then((m) => m.FinanceComponent),
          },
          {
            path: ":id",
            loadComponent: () =>
              import("./features/billing/invoice-detail.component").then((m) => m.InvoiceDetailComponent),
          },
        ],
      },
      {
        path: "reporting",
        loadComponent: () => import("./features/reporting/reporting.component").then((m) => m.ReportingComponent),
      },
      {
        path: "settings",
        loadComponent: () => import("./features/settings/settings.component").then((m) => m.SettingsComponent),
      },
    ],
  },
  { path: "**", redirectTo: "dashboard" },
];
