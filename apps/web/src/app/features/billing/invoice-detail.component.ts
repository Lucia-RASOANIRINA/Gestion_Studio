import { DatePipe, DecimalPipe } from "@angular/common";
import { Component, ElementRef, computed, inject, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { BillingService } from "./billing.service";
import {
  INVOICE_STATUSES,
  PAYMENT_METHODS,
  type Invoice,
  type InvoiceStatus,
  type PaymentMethod,
} from "./billing.model";

@Component({
  selector: "gs-invoice-detail",
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, TranslateModule, GsIconComponent],
  templateUrl: "./invoice-detail.component.html",
})
export class InvoiceDetailComponent {
  private readonly billing = inject(BillingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly invoice = signal<Invoice | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly statuses = INVOICE_STATUSES;
  readonly methods = PAYMENT_METHODS;

  // Formulaire de paiement.
  readonly payAmount = signal<number | null>(null);
  readonly payMethod = signal<PaymentMethod>("MOBILE_MONEY");
  readonly payReference = signal("");
  readonly recording = signal(false);

  readonly balance = computed(() => this.invoice()?.totals.balance ?? 0);

  // Signature électronique.
  readonly signModalOpen = signal(false);
  readonly signerName = signal("");
  readonly signaturePad = viewChild<ElementRef<HTMLCanvasElement>>("sigCanvas");
  private drawing = false;
  private hasStroke = false;

  constructor() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) void this.load(id);
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const invoice = await this.billing.getById(id);
      this.invoice.set(invoice);
      this.payAmount.set(invoice.totals.balance || null);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  statusBadgeClass(status: InvoiceStatus): string {
    const map: Record<InvoiceStatus, string> = {
      DRAFT: "bg-gs-hover text-gs-light/70",
      SENT: "bg-gs-navy text-gs-blue",
      PARTIAL: "bg-gs-dark-violet/30 text-gs-violet",
      PAID: "bg-gs-green/15 text-gs-green",
      OVERDUE: "bg-gs-orange/15 text-gs-orange",
      CANCELLED: "bg-gs-hover text-gs-light/40 line-through",
    };
    return map[status];
  }

  async changeStatus(status: InvoiceStatus): Promise<void> {
    const current = this.invoice();
    if (!current) return;
    try {
      this.invoice.set(await this.billing.updateStatus(current.id, status));
    } catch {
      this.error.set(true);
    }
  }

  async recordPayment(): Promise<void> {
    const current = this.invoice();
    const amount = Number(this.payAmount());
    if (!current || !amount || amount <= 0) return;
    this.recording.set(true);
    this.error.set(false);
    try {
      const updated = await this.billing.addPayment(current.id, {
        amount,
        method: this.payMethod(),
        reference: this.payReference().trim() || null,
      });
      this.invoice.set(updated);
      this.payAmount.set(updated.totals.balance || null);
      this.payReference.set("");
    } catch {
      this.error.set(true);
    } finally {
      this.recording.set(false);
    }
  }

  /** Ouvre la boîte d'impression du navigateur (permet « Enregistrer au format PDF »). */
  downloadPdf(): void {
    window.print();
  }

  openSign(): void {
    this.signerName.set(this.invoice()?.client.name ?? "");
    this.hasStroke = false;
    this.signModalOpen.set(true);
  }

  private ctx(): CanvasRenderingContext2D | null {
    const canvas = this.signaturePad()?.nativeElement;
    return canvas ? canvas.getContext("2d") : null;
  }

  private pointerPos(event: PointerEvent): { x: number; y: number } {
    const canvas = this.signaturePad()!.nativeElement;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  startDraw(event: PointerEvent): void {
    const ctx = this.ctx();
    if (!ctx) return;
    this.drawing = true;
    this.hasStroke = true;
    const { x, y } = this.pointerPos(event);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  moveDraw(event: PointerEvent): void {
    if (!this.drawing) return;
    const ctx = this.ctx();
    if (!ctx) return;
    const { x, y } = this.pointerPos(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  endDraw(): void {
    this.drawing = false;
  }

  clearSignature(): void {
    const canvas = this.signaturePad()?.nativeElement;
    const ctx = this.ctx();
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.hasStroke = false;
  }

  async saveSignature(): Promise<void> {
    const current = this.invoice();
    const canvas = this.signaturePad()?.nativeElement;
    if (!current || !canvas || !this.hasStroke || this.signerName().trim().length < 2) return;
    // Fond blanc pour un rendu propre en PDF.
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ex = exportCanvas.getContext("2d")!;
    ex.fillStyle = "#ffffff";
    ex.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ex.drawImage(canvas, 0, 0);
    const dataUrl = exportCanvas.toDataURL("image/png");
    try {
      const updated = await this.billing.signInvoice(current.id, dataUrl, this.signerName().trim());
      this.invoice.set(updated);
      this.signModalOpen.set(false);
    } catch {
      this.error.set(true);
    }
  }

  async remove(): Promise<void> {
    const current = this.invoice();
    if (!current) return;
    // eslint-disable-next-line no-alert
    if (!confirm(current.reference)) return;
    try {
      await this.billing.remove(current.id);
      await this.router.navigate(["/billing"]);
    } catch {
      this.error.set(true);
    }
  }
}
