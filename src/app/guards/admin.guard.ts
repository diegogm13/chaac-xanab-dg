import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Primero verifica sesión activa
  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);

  // Luego verifica rol
  if (auth.isAdmin()) return true;

  return router.createUrlTree(['/']);
};
