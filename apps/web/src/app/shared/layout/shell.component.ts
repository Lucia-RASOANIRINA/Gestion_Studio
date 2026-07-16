import { DatePipe, NgClass } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { filter } from "rxjs";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { AuthService } from "../../core/auth/auth.service";
import { ThemeService } from "../../core/theme/theme.service";
import { NotificationsService } from "../../core/notifications/notifications.service";
import { DialogService } from "../../core/ui/dialog.service";
import { SettingsService } from "../../features/settings/settings.service";
import { GsIconComponent, type IconName } from "../icon/icon.component";

interface NavItem {
  path: string;
  labelKey: string;
  icon: IconName;
}

@Component({
  selector: "gs-shell",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, GsIconComponent, NgClass, DatePipe],
  templateUrl: "./shell.component.html",
})
export class ShellComponent {
  private readonly translate = inject(TranslateService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  private readonly settings = inject(SettingsService);
  private readonly dialog = inject(DialogService);
  readonly notifications = inject(NotificationsService);

  readonly sidebarOpen = signal(false);
  readonly notifOpen = signal(false);
  readonly userName = signal<string>("");
  readonly currentLang = signal<string>(this.translate.currentLang || "fr");

  readonly isLight = computed(() => this.theme.resolved() === "light");

  readonly navItems: NavItem[] = [
    { path: "/dashboard", labelKey: "nav.dashboard", icon: "dashboard" },
    { path: "/clients", labelKey: "nav.clients", icon: "clients" },
    { path: "/projects", labelKey: "nav.projects", icon: "projects" },
    { path: "/planning", labelKey: "nav.planning", icon: "planning" },
    { path: "/resources", labelKey: "nav.resources", icon: "resources" },
    { path: "/studios", labelKey: "nav.studios", icon: "studios" },
    { path: "/hr", labelKey: "nav.hr", icon: "user" },
    { path: "/billing", labelKey: "nav.billing", icon: "billing" },
    { path: "/reporting", labelKey: "nav.reporting", icon: "reporting" },
    { path: "/settings", labelKey: "nav.settings", icon: "settings" },
  ];

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.sidebarOpen.set(false);
      this.notifOpen.set(false);
    });
    this.translate.onLangChange.subscribe((event) => this.currentLang.set(event.lang));
    void this.loadProfile();
    void this.notifications.refresh();
  }

  toggleNotif(): void {
    this.notifOpen.update((open) => !open);
    if (this.notifOpen()) void this.notifications.refresh();
  }

  markAllRead(): void {
    void this.notifications.markAllRead();
  }

  private async loadProfile(): Promise<void> {
    try {
      const profile = await this.settings.getProfile();
      this.userName.set(`${profile.firstName} ${profile.lastName}`.trim());
      this.currentLang.set(profile.locale);
      this.translate.use(profile.locale);
      this.theme.hydrateFromServer(profile.theme);
    } catch {
      // silencieux : l'utilisateur peut ne pas être encore chargé
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  toggleTheme(): void {
    this.theme.set(this.isLight() ? "dark" : "light");
    void this.settings.updateProfile({ theme: this.isLight() ? "light" : "dark" }).catch(() => undefined);
  }

  useLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    void this.settings.updateProfile({ locale: lang as "fr" | "en" }).catch(() => undefined);
  }

  async logout(): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: this.translate.instant("auth.logout.title"),
      message: this.translate.instant("auth.logout.message"),
      confirmLabel: this.translate.instant("auth.logout.confirm"),
      cancelLabel: this.translate.instant("common.dialog.cancel"),
      icon: "logout",
    });
    if (confirmed) {
      void this.auth.logout();
    }
  }
}
