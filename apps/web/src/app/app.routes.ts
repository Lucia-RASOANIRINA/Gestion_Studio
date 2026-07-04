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
        loadComponent: () => import("./features/clients/clients.component").then((m) => m.ClientsComponent),
      },
      {
        path: "projects",
        loadComponent: () => import("./features/projects/projects.component").then((m) => m.ProjectsComponent),
      },
      {
        path: "planning",
        loadComponent: () => import("./features/planning/planning.component").then((m) => m.PlanningComponent),
      },
      {
        path: "resources",
        loadComponent: () => import("./features/resources/resources.component").then((m) => m.ResourcesComponent),
      },
      {
        path: "billing",
        loadComponent: () => import("./features/billing/billing.component").then((m) => m.BillingComponent),
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
