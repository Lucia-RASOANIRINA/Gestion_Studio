import type { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { AuthService } from "../auth/auth.service";

/**
 * Sur une réponse 401 (hors endpoints d'authentification), la session est
 * considérée expirée/invalide : on efface le token local et on redirige vers
 * la connexion, plutôt que de laisser l'écran dans un état incohérent.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Tous les endpoints /auth/ (login, refresh, 2fa/*) gèrent leurs propres 401
  // (mauvais mot de passe ou code 2FA invalide) sans déconnecter la session.
  const isAuthEndpoint = req.url.includes("/auth/");

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        auth.clearSession();
        if (!router.url.startsWith("/login")) {
          void router.navigateByUrl("/login");
        }
      }
      return throwError(() => error);
    })
  );
};
