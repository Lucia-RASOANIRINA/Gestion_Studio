import { Injectable, signal } from "@angular/core";

export interface DialogRequest {
  /** Clé i18n ou texte du titre. */
  title: string;
  /** Clé i18n ou texte du message (optionnel). */
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style d'action destructrice (bouton rouge). */
  danger?: boolean;
  /** Icône affichée dans l'en-tête. */
  icon?: string;
  /** Affiche un champ de saisie (mode « prompt »). */
  withInput?: boolean;
  inputPlaceholder?: string;
  inputValue?: string;
}

interface OpenDialog extends DialogRequest {
  resolve: (value: string | boolean | null) => void;
}

/**
 * Service de dialogues in-app (confirmation / saisie) remplaçant les
 * `window.confirm` / `window.prompt` natifs par une interface stylée et traduite.
 */
@Injectable({ providedIn: "root" })
export class DialogService {
  readonly current = signal<OpenDialog | null>(null);
  /** Valeur du champ de saisie (mode prompt), gérée ici pour éviter tout effet. */
  readonly inputValue = signal("");

  /** Ouvre une confirmation. Résout `true` si confirmé, `false` sinon. */
  confirm(request: DialogRequest): Promise<boolean> {
    return new Promise((resolve) => {
      this.inputValue.set("");
      this.current.set({ ...request, resolve: (v) => resolve(v === true) });
    });
  }

  /** Ouvre une saisie. Résout la valeur saisie, ou `null` si annulé. */
  prompt(request: DialogRequest): Promise<string | null> {
    return new Promise((resolve) => {
      this.inputValue.set(request.inputValue ?? "");
      this.current.set({
        ...request,
        withInput: true,
        resolve: (v) => resolve(typeof v === "string" ? v : null),
      });
    });
  }

  confirmWith(value: string | boolean): void {
    this.current()?.resolve(value);
    this.current.set(null);
  }

  cancel(): void {
    this.current()?.resolve(null);
    this.current.set(null);
  }
}
