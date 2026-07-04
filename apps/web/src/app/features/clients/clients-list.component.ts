import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";
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

  readonly segments = CLIENT_SEGMENTS;
  readonly clients = signal<Client[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly search = signal("");
  readonly segmentFilter = signal("");

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.clientsService.list({
        search: this.search() || undefined,
        segment: this.segmentFilter() || undefined,
        pageSize: 50,
      });
      this.clients.set(result.items);
      this.total.set(result.total);
    } finally {
      this.loading.set(false);
    }
  }

  async remove(client: Client): Promise<void> {
    if (!confirm(`Supprimer ${client.name} ?`)) return;
    await this.clientsService.remove(client.id);
    await this.load();
  }

  segmentBadgeClass(segment: string): string {
    const classes: Record<string, string> = {
      ARTIST: "bg-gs-violet/20 text-gs-violet",
      LABEL: "bg-gs-blue/20 text-gs-blue",
      ADVERTISING_AGENCY: "bg-gs-orange/20 text-gs-orange",
      COMPANY: "bg-gs-green/20 text-gs-green",
      INSTITUTION: "bg-gs-navy text-gs-light",
      OTHER: "bg-white/10 text-gs-light/70",
    };
    return classes[segment] ?? classes["OTHER"];
  }
}
