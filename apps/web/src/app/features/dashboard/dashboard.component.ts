import { Component } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent, type IconName } from "../../shared/icon/icon.component";

interface StatCard {
  labelKey: string;
  value: string;
  icon: IconName;
}

@Component({
  selector: "gs-dashboard",
  standalone: true,
  imports: [TranslateModule, GsIconComponent],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent {
  readonly stats: StatCard[] = [
    { labelKey: "nav.clients", value: "—", icon: "clients" },
    { labelKey: "nav.projects", value: "—", icon: "projects" },
    { labelKey: "nav.planning", value: "—", icon: "planning" },
    { labelKey: "nav.billing", value: "—", icon: "billing" },
  ];
}
