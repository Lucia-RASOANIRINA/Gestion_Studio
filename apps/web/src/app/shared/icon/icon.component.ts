import { Component, input } from "@angular/core";
import {
  LucideArrowLeft,
  LucideBarChart3,
  LucideBoxes,
  LucideCalendarDays,
  LucideCheck,
  LucideFolderKanban,
  LucideGlobe,
  LucideLayoutDashboard,
  LucideLock,
  LucideLogOut,
  LucideMail,
  LucideMenu,
  LucideMusic,
  LucidePencil,
  LucidePlus,
  LucideReceipt,
  LucideSearch,
  LucideSettings,
  LucideTrash2,
  LucideUsers,
  LucideX,
} from "@lucide/angular";

export type IconName =
  | "dashboard"
  | "clients"
  | "projects"
  | "planning"
  | "resources"
  | "billing"
  | "reporting"
  | "settings"
  | "logout"
  | "menu"
  | "close"
  | "language"
  | "mail"
  | "lock"
  | "logo"
  | "search"
  | "add"
  | "edit"
  | "delete"
  | "back"
  | "check";

@Component({
  selector: "gs-icon",
  standalone: true,
  imports: [
    LucideLayoutDashboard,
    LucideUsers,
    LucideFolderKanban,
    LucideCalendarDays,
    LucideBoxes,
    LucideReceipt,
    LucideBarChart3,
    LucideSettings,
    LucideLogOut,
    LucideMenu,
    LucideX,
    LucideGlobe,
    LucideMail,
    LucideLock,
    LucideMusic,
    LucideSearch,
    LucidePlus,
    LucidePencil,
    LucideTrash2,
    LucideArrowLeft,
    LucideCheck,
  ],
  template: `
    @switch (name()) {
      @case ("dashboard") {
        <svg lucideLayoutDashboard [size]="size()"></svg>
      }
      @case ("clients") {
        <svg lucideUsers [size]="size()"></svg>
      }
      @case ("projects") {
        <svg lucideFolderKanban [size]="size()"></svg>
      }
      @case ("planning") {
        <svg lucideCalendarDays [size]="size()"></svg>
      }
      @case ("resources") {
        <svg lucideBoxes [size]="size()"></svg>
      }
      @case ("billing") {
        <svg lucideReceipt [size]="size()"></svg>
      }
      @case ("reporting") {
        <svg lucideBarChart3 [size]="size()"></svg>
      }
      @case ("settings") {
        <svg lucideSettings [size]="size()"></svg>
      }
      @case ("logout") {
        <svg lucideLogOut [size]="size()"></svg>
      }
      @case ("menu") {
        <svg lucideMenu [size]="size()"></svg>
      }
      @case ("close") {
        <svg lucideX [size]="size()"></svg>
      }
      @case ("language") {
        <svg lucideGlobe [size]="size()"></svg>
      }
      @case ("mail") {
        <svg lucideMail [size]="size()"></svg>
      }
      @case ("lock") {
        <svg lucideLock [size]="size()"></svg>
      }
      @case ("logo") {
        <svg lucideMusic [size]="size()"></svg>
      }
      @case ("search") {
        <svg lucideSearch [size]="size()"></svg>
      }
      @case ("add") {
        <svg lucidePlus [size]="size()"></svg>
      }
      @case ("edit") {
        <svg lucidePencil [size]="size()"></svg>
      }
      @case ("delete") {
        <svg lucideTrash2 [size]="size()"></svg>
      }
      @case ("back") {
        <svg lucideArrowLeft [size]="size()"></svg>
      }
      @case ("check") {
        <svg lucideCheck [size]="size()"></svg>
      }
    }
  `,
})
export class GsIconComponent {
  readonly name = input.required<IconName>();
  readonly size = input<number>(20);
}
