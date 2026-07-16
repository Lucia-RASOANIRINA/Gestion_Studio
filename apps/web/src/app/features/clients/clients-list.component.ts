import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
import { resolveErrorMessageKey } from "../../shared/http-error.util";
import { CLIENT_SEGMENTS, type Client } from "./client.model";
import { ClientsService } from "./clients.service";

@Component({
  selector: "gs-clients-list",
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule, GsIconComponent],
  templateUrl: "./clients-list.component.html",
})
export class ClientsListComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);
  private readonly translate = inject(TranslateService);

  readonly segments = CLIENT_SEGMENTS;
  readonly clients = signal<Client[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly search = signal("");
  readonly segmentFilter = signal("");
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await this.clientsService.list({
        search: this.search() || undefined,
        segment: this.segmentFilter() || undefined,
        pageSize: 50,
      });
      this.clients.set(result.items);
      this.total.set(result.total);
    } catch (error) {
      this.error.set(resolveErrorMessageKey(error));
    } finally {
      this.loading.set(false);
    }
  }

  async remove(client: Client): Promise<void> {
    if (!confirm(`Supprimer ${client.name} ?`)) return;
    try {
      await this.clientsService.remove(client.id);
      await this.load();
    } catch (error) {
      const key = resolveErrorMessageKey(error, { 400: "clients.delete_conflict", 409: "clients.delete_conflict" });
      alert(this.translate.instant(key));
    }
  }

  segmentBadgeClass(segment: string): string {
    const classes: Record<string, string> = {
      ARTIST: "bg-gs-violet/20 text-gs-violet",
      LABEL: "bg-gs-blue/20 text-gs-blue",
      ADVERTISING_AGENCY: "bg-gs-orange/20 text-gs-orange",
      COMPANY: "bg-gs-green/20 text-gs-green",
      INSTITUTION: "bg-gs-navy text-gs-light",
      OTHER: "bg-gs-hover text-gs-light/70",
    };
    return classes[segment] ?? classes["OTHER"];
  }

  tierBadgeClass(tier: string): string {
    const classes: Record<string, string> = {
      BRONZE: "bg-gs-orange/15 text-gs-orange",
      SILVER: "bg-gs-hover text-gs-light/70",
      GOLD: "bg-gs-green/15 text-gs-green",
      PLATINUM: "bg-gs-blue/15 text-gs-blue",
    };
    return classes[tier] ?? classes["BRONZE"];
  }

  async toggleBlacklist(client: Client): Promise<void> {
    let reason: string | null = client.blacklistReason;
    if (!client.isBlacklisted) {
      reason = prompt(this.translate.instant("clients.blacklist.reason_prompt")) ?? null;
      if (reason === null) return; // annulé
    }
    try {
      const updated = await this.clientsService.setBlacklist(client.id, !client.isBlacklisted, reason);
      this.clients.update((list) => list.map((c) => (c.id === updated.id ? updated : c)));
    } catch (error) {
      alert(this.translate.instant(resolveErrorMessageKey(error)));
    }
  }
}
