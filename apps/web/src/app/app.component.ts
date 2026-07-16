import { Component, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterOutlet } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ThemeService } from "./core/theme/theme.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  private readonly translate = inject(TranslateService);
  private readonly titleService = inject(Title);
  // Instancié au démarrage pour appliquer le thème enregistré dès le premier rendu.
  private readonly theme = inject(ThemeService);

  constructor() {
    this.translate.addLangs(["fr", "en"]);
    this.translate.onLangChange.subscribe(() => this.updateDocumentTitle());
    this.translate.use("fr");
  }

  private updateDocumentTitle(): void {
    this.translate.get("app.title").subscribe((title: string) => this.titleService.setTitle(title));
  }
}
