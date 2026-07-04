import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { AuthService } from "../../../core/auth/auth.service";
import { GsIconComponent } from "../../../shared/icon/icon.component";

@Component({
  selector: "gs-login",
  standalone: true,
  imports: [FormsModule, TranslateModule, GsIconComponent],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = "admin@gestion-studio.mg";
  password = "";
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.auth.login(this.email, this.password);
      await this.router.navigateByUrl("/dashboard");
    } catch {
      this.error.set("auth.login.error");
    } finally {
      this.loading.set(false);
    }
  }
}
