import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { DialogService } from "../../core/ui/dialog.service";
import { GsIconComponent, type IconName } from "../icon/icon.component";

/** Rendu du dialogue de confirmation / saisie piloté par le DialogService. */
@Component({
  selector: "gs-confirm-dialog",
  standalone: true,
  imports: [FormsModule, TranslateModule, GsIconComponent],
  template: `
    @if (dialog.current(); as d) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" (click)="onCancel()">
        <div class="w-full max-w-sm rounded-xl border border-gs-border bg-gs-dark-gray p-5 shadow-xl" (click)="$event.stopPropagation()">
          <div class="flex items-start gap-3">
            <span
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              [class]="d.danger ? 'bg-gs-orange/15 text-gs-orange' : 'bg-gs-blue/15 text-gs-blue'"
            >
              <gs-icon [name]="icon(d.icon, d.danger)" [size]="20" />
            </span>
            <div class="min-w-0 flex-1">
              <h3 class="font-display text-lg font-semibold">{{ d.title }}</h3>
              @if (d.message) {
                <p class="mt-1 text-sm text-gs-light/70">{{ d.message }}</p>
              }
              @if (d.withInput) {
                <input
                  type="text"
                  [ngModel]="dialog.inputValue()"
                  (ngModelChange)="dialog.inputValue.set($event)"
                  [placeholder]="d.inputPlaceholder || ''"
                  class="mt-3 w-full rounded-md border border-gs-border bg-gs-black px-3 py-2 text-sm outline-none focus:border-gs-blue"
                />
              }
            </div>
          </div>
          <div class="mt-5 flex items-center justify-end gap-3">
            <button type="button" class="text-sm text-gs-light/60 hover:text-gs-light" (click)="onCancel()">
              {{ d.cancelLabel || ('common.dialog.cancel' | translate) }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md px-4 py-2 text-sm font-semibold text-gs-black hover:opacity-90"
              [class]="d.danger ? 'bg-gs-orange' : 'bg-gs-blue'"
              (click)="onConfirm()"
            >
              <gs-icon [name]="d.danger ? 'delete' : 'check'" [size]="15" />
              {{ d.confirmLabel || ('common.dialog.confirm' | translate) }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly dialog = inject(DialogService);

  icon(name: string | undefined, danger: boolean | undefined): IconName {
    return (name as IconName) ?? (danger ? "alert" : "check");
  }

  onConfirm(): void {
    const d = this.dialog.current();
    if (!d) return;
    this.dialog.confirmWith(d.withInput ? this.dialog.inputValue().trim() : true);
  }

  onCancel(): void {
    this.dialog.cancel();
  }
}
