import { Component, inject } from "@angular/core";
import { ToastService, type ToastType } from "../../core/ui/toast.service";
import { GsIconComponent, type IconName } from "../icon/icon.component";

/** Rendu de la pile de toasts (messages éphémères) piloté par le ToastService. */
@Component({
  selector: "gs-toast-container",
  standalone: true,
  imports: [GsIconComponent],
  template: `
    <div class="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg bg-gs-dark-gray"
          [class]="borderClass(toast.type)"
          role="status"
        >
          <span class="flex-shrink-0" [class]="colorClass(toast.type)">
            <gs-icon [name]="icon(toast.type)" [size]="18" />
          </span>
          <p class="min-w-0 flex-1 text-sm text-gs-light">{{ toast.message }}</p>
          <button type="button" class="flex-shrink-0 text-gs-light/50 hover:text-gs-light" (click)="toasts.dismiss(toast.id)">
            <gs-icon name="close" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toasts = inject(ToastService);

  icon(type: ToastType): IconName {
    return type === "success" ? "check" : type === "error" ? "alert" : "info";
  }

  colorClass(type: ToastType): string {
    return type === "success" ? "text-gs-green" : type === "error" ? "text-gs-orange" : "text-gs-blue";
  }

  borderClass(type: ToastType): string {
    return type === "success"
      ? "border-gs-green/40"
      : type === "error"
        ? "border-gs-orange/40"
        : "border-gs-blue/40";
  }
}
