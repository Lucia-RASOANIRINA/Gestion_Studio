import { Injectable, signal } from "@angular/core";

export type ThemePreference = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

const STORAGE_KEY = "gs_theme";

/**
 * Gère le thème clair/sombre : applique une classe sur <html>, persiste le choix
 * localement et suit la préférence système quand "system" est sélectionné.
 */
@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly media = window.matchMedia("(prefers-color-scheme: light)");

  readonly preference = signal<ThemePreference>(this.readStored());
  readonly resolved = signal<ResolvedTheme>(this.resolve(this.preference()));

  constructor() {
    this.apply(this.preference());
    // Réagit aux changements du thème système lorsque la préférence est "system".
    this.media.addEventListener("change", () => {
      if (this.preference() === "system") {
        this.apply("system");
      }
    });
  }

  /** Définit la préférence, l'applique et la persiste localement. */
  set(preference: ThemePreference): void {
    this.preference.set(preference);
    localStorage.setItem(STORAGE_KEY, preference);
    this.apply(preference);
  }

  /** Applique une préférence issue du serveur sans écraser un choix local déjà fait. */
  hydrateFromServer(preference: ThemePreference): void {
    if (localStorage.getItem(STORAGE_KEY)) return;
    this.preference.set(preference);
    this.apply(preference);
  }

  private apply(preference: ThemePreference): void {
    const resolved = this.resolve(preference);
    this.resolved.set(resolved);
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light");
    root.classList.add(resolved === "light" ? "theme-light" : "theme-dark");
  }

  private resolve(preference: ThemePreference): ResolvedTheme {
    if (preference === "system") {
      return this.media.matches ? "light" : "dark";
    }
    return preference;
  }

  private readStored(): ThemePreference {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "dark";
  }
}
