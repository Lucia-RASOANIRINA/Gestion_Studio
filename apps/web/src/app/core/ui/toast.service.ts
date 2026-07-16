import { Injectable, signal } from "@angular/core";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

/**
 * File de notifications éphémères (toasts) in-app remplaçant `window.alert`
 * pour les messages de succès / erreur / information.
 */
@Injectable({ providedIn: "root" })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  private push(type: ToastType, message: string, durationMs = 4000): void {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  success(message: string): void {
    this.push("success", message);
  }

  error(message: string): void {
    this.push("error", message, 6000);
  }

  info(message: string): void {
    this.push("info", message);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
