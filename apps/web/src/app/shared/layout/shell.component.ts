import { NgClass } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { filter } from "rxjs";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { AuthService } from "../../core/auth/auth.service";
import { GsIconComponent, type IconName } from "../icon/icon.component";

interface NavItem {
  path: string;
  labelKey: string;
  icon: IconName;
}

@Component({
  selector: "gs-shell",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, GsIconComponent, NgClass],
  templateUrl: "./shell.component.html",
})
export class ShellComponent {
  private readonly translate = inject(TranslateService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly sidebarOpen = signal(false);

  readonly navItems: NavItem[] = [
    { path: "/dashboard", labelKey: "nav.dashboard", icon: "dashboard" },
    { path: "/clients", labelKey: "nav.clients", icon: "clients" },
    { path: "/projects", labelKey: "nav.projects", icon: "projects" },
    { path: "/planning", labelKey: "nav.planning", icon: "planning" },
    { path: "/resources", labelKey: "nav.resources", icon: "resources" },
    { path: "/billing", labelKey: "nav.billing", icon: "billing" },
    { path: "/reporting", labelKey: "nav.reporting", icon: "reporting" },
    { path: "/settings", labelKey: "nav.settings", icon: "settings" },
  ];

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.sidebarOpen.set(false);
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  useLanguage(lang: string): void {
    this.translate.use(lang);
  }

  logout(): void {
    void this.auth.logout();
  }
}
