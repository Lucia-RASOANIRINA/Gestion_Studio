import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { ThemeService, type ThemePreference } from "../../core/theme/theme.service";
import { AuthService, type TwoFactorSetup } from "../../core/auth/auth.service";
import { SettingsService } from "./settings.service";
import type { UserProfile } from "./settings.model";

@Component({
  selector: "gs-settings",
  standalone: true,
  imports: [FormsModule, DatePipe, TranslateModule, GsIconComponent],
  templateUrl: "./settings.component.html",
})
export class SettingsComponent {
  private readonly settings = inject(SettingsService);
  private readonly theme = inject(ThemeService);
  private readonly translate = inject(TranslateService);
  private readonly auth = inject(AuthService);

  // Double authentification (2FA / TOTP).
  readonly twoFactorSetup = signal<TwoFactorSetup | null>(null);
  readonly enableCode = signal("");
  readonly disableCode = signal("");
  readonly twoFactorError = signal(false);
  readonly twoFactorBusy = signal(false);

  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly savedAt = signal<number | null>(null);
  readonly error = signal(false);

  // Champs éditables du profil.
  readonly firstName = signal("");
  readonly lastName = signal("");
  readonly phone = signal("");
  readonly locale = signal<"fr" | "en">("fr");

  readonly themePreference = computed(() => this.theme.preference());

  readonly themeOptions: { value: ThemePreference; labelKey: string; icon: "settings" }[] = [
    { value: "dark", labelKey: "settings.theme.dark", icon: "settings" },
    { value: "light", labelKey: "settings.theme.light", icon: "settings" },
    { value: "system", labelKey: "settings.theme.system", icon: "settings" },
  ];

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const profile = await this.settings.getProfile();
      this.profile.set(profile);
      this.firstName.set(profile.firstName);
      this.lastName.set(profile.lastName);
      this.phone.set(profile.phone ?? "");
      this.locale.set(profile.locale);
      this.theme.hydrateFromServer(profile.theme);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  /** Applique le thème immédiatement et le persiste côté serveur. */
  async selectTheme(preference: ThemePreference): Promise<void> {
    this.theme.set(preference);
    try {
      await this.settings.updateProfile({ theme: preference });
      this.flashSaved();
    } catch {
      this.error.set(true);
    }
  }

  async changeLanguage(locale: "fr" | "en"): Promise<void> {
    this.locale.set(locale);
    this.translate.use(locale);
    try {
      await this.settings.updateProfile({ locale });
      this.flashSaved();
    } catch {
      this.error.set(true);
    }
  }

  async saveProfile(): Promise<void> {
    this.saving.set(true);
    this.error.set(false);
    try {
      const updated = await this.settings.updateProfile({
        firstName: this.firstName().trim(),
        lastName: this.lastName().trim(),
        phone: this.phone().trim() || null,
      });
      this.profile.set(updated);
      this.flashSaved();
    } catch {
      this.error.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  private flashSaved(): void {
    this.savedAt.set(Date.now());
    setTimeout(() => this.savedAt.set(null), 2500);
  }

  async startTwoFactorSetup(): Promise<void> {
    this.twoFactorError.set(false);
    this.twoFactorBusy.set(true);
    try {
      this.twoFactorSetup.set(await this.auth.setup2fa());
    } catch {
      this.twoFactorError.set(true);
    } finally {
      this.twoFactorBusy.set(false);
    }
  }

  cancelTwoFactorSetup(): void {
    this.twoFactorSetup.set(null);
    this.enableCode.set("");
    this.twoFactorError.set(false);
  }

  async confirmEnable(): Promise<void> {
    if (!/^\d{6}$/.test(this.enableCode())) return;
    this.twoFactorError.set(false);
    this.twoFactorBusy.set(true);
    try {
      await this.auth.enable2fa(this.enableCode());
      this.twoFactorSetup.set(null);
      this.enableCode.set("");
      await this.reloadProfile();
      this.flashSaved();
    } catch {
      this.twoFactorError.set(true);
    } finally {
      this.twoFactorBusy.set(false);
    }
  }

  async confirmDisable(): Promise<void> {
    if (!/^\d{6}$/.test(this.disableCode())) return;
    this.twoFactorError.set(false);
    this.twoFactorBusy.set(true);
    try {
      await this.auth.disable2fa(this.disableCode());
      this.disableCode.set("");
      await this.reloadProfile();
      this.flashSaved();
    } catch {
      this.twoFactorError.set(true);
    } finally {
      this.twoFactorBusy.set(false);
    }
  }

  private async reloadProfile(): Promise<void> {
    try {
      this.profile.set(await this.settings.getProfile());
    } catch {
      /* ignore */
    }
  }
}
