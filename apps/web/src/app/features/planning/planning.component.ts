import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { resolveErrorMessageKey } from "../../shared/http-error.util";
import { DialogService } from "../../core/ui/dialog.service";
import { ToastService } from "../../core/ui/toast.service";
import {
  addDays,
  addMonths,
  endOfDay,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  formatTime,
} from "./date-utils";
import { STUDIO_ROOMS, type Booking, type StudioRoom } from "./planning.model";
import { PlanningService } from "./planning.service";

type ViewMode = "day" | "week" | "month";

@Component({
  selector: "gs-planning",
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule, GsIconComponent],
  templateUrl: "./planning.component.html",
})
export class PlanningComponent implements OnInit {
  private readonly planningService = inject(PlanningService);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(DialogService);
  private readonly toast = inject(ToastService);

  readonly studios = STUDIO_ROOMS;
  readonly view = signal<ViewMode>("day");
  readonly refDate = signal<Date>(startOfDay(new Date()));
  readonly studioFilter = signal<StudioRoom | "">("");
  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly weekDays = computed(() => {
    const start = startOfWeek(this.refDate());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  });

  readonly monthGridDays = computed(() => {
    const gridStart = startOfWeek(startOfMonth(this.refDate()));
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  });

  readonly rangeLabel = computed(() => {
    const date = this.refDate();
    if (this.view() === "day") {
      return date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    if (this.view() === "week") {
      const days = this.weekDays();
      return `${days[0].toLocaleDateString()} — ${days[6].toLocaleDateString()}`;
    }
    return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  });

  ngOnInit(): void {
    void this.load();
  }

  private currentRange(): { from: Date; to: Date } {
    if (this.view() === "day") {
      return { from: startOfDay(this.refDate()), to: endOfDay(this.refDate()) };
    }
    if (this.view() === "week") {
      const days = this.weekDays();
      return { from: days[0], to: endOfDay(days[6]) };
    }
    const days = this.monthGridDays();
    return { from: days[0], to: endOfDay(days[41]) };
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const { from, to } = this.currentRange();
      const bookings = await this.planningService.list({
        from: from.toISOString(),
        to: to.toISOString(),
        studio: this.studioFilter() || undefined,
      });
      this.bookings.set(bookings);
    } catch (error) {
      this.error.set(resolveErrorMessageKey(error));
    } finally {
      this.loading.set(false);
    }
  }

  setView(view: ViewMode): void {
    this.view.set(view);
    void this.load();
  }

  goToday(): void {
    this.refDate.set(startOfDay(new Date()));
    void this.load();
  }

  goPrev(): void {
    this.shift(-1);
  }

  goNext(): void {
    this.shift(1);
  }

  private shift(direction: 1 | -1): void {
    const view = this.view();
    if (view === "day") {
      this.refDate.set(addDays(this.refDate(), direction));
    } else if (view === "week") {
      this.refDate.set(addDays(this.refDate(), direction * 7));
    } else {
      this.refDate.set(addMonths(this.refDate(), direction));
    }
    void this.load();
  }

  selectDay(date: Date): void {
    this.refDate.set(startOfDay(date));
    this.view.set("day");
    void this.load();
  }

  bookingsForStudioOnDay(studio: StudioRoom, date: Date): Booking[] {
    return this.bookings()
      .filter((b) => b.studio === studio && isSameDay(new Date(b.startAt), date))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }

  bookingsForDay(date: Date): Booking[] {
    return this.bookings()
      .filter((b) => isSameDay(new Date(b.startAt), date))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }

  isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.refDate().getMonth();
  }

  formatTime(iso: string): string {
    return formatTime(new Date(iso));
  }

  bookingClass(booking: Booking): string {
    if (booking.type === "UNAVAILABILITY") {
      return "bg-gs-orange/20 text-gs-orange border-gs-orange/40";
    }
    return "bg-gs-blue/20 text-gs-blue border-gs-blue/40";
  }

  async remove(booking: Booking, event: Event): Promise<void> {
  // Empecher la propagation et le comportement par defaut
  event.stopPropagation();
  event.preventDefault();
  
  const confirmed = await this.dialog.confirm({
    title: this.translate.instant("common.dialog.delete_title"),
    message: this.translate.instant("common.dialog.delete_named", { name: booking.title }),
    confirmLabel: this.translate.instant("common.dialog.delete"),
    danger: true,
    icon: "delete",
  });
  
  if (!confirmed) return;
  
  try {
    await this.planningService.remove(booking.id);
    this.toast.success(this.translate.instant("common.toast.deleted"));
    await this.load();
  } catch (error) {
    this.toast.error(this.translate.instant(resolveErrorMessageKey(error)));
  }
}

  downloadIcs(booking: Booking, event: Event): void {
    event.stopPropagation();
    window.open(this.planningService.icsUrl(booking.id), "_blank");
  }
}
