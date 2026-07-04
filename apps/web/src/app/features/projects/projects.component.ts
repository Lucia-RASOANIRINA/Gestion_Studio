import { Component } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { GsIconComponent } from "../../shared/icon/icon.component";

@Component({
  selector: "gs-projects",
  standalone: true,
  imports: [TranslateModule, GsIconComponent],
  template: `
    <div class="flex items-center gap-2 mb-2">
      <gs-icon name="projects" [size]="22" class="text-gs-blue" />
      <h2 class="font-display text-2xl font-semibold">{{ 'nav.projects' | translate }}</h2>
    </div>
    <p class="text-gs-light/60">{{ 'common.coming_soon' | translate }}</p>
  `,
})
export class ProjectsComponent {}
