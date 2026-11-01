/**
 * src/app/core/guards/auth.guard.ts
 *
 * Guardas de ruta: `autenticadoGuard` y `rolGuard(minimo)`.
 *
 * En React esto era un `<RequireAuth>` envolviendo el JSX. En Angular es una
 * función que devuelve `boolean` o `UrlTree`, y la ruta solo se activa si
 * devuelve lo primero. Devolver un `UrlTree` en vez de `false` es lo que hace
 * que, al no estar autenticado, el usuario aterrice en la pantalla de login en
 * lugar de quedarse en una pantalla en blanco.
 *
 * Aviso importante: la guarda es CÓDIGO DE COMODIDAD, no una puerta de
 * seguridad. Ocultar un botón no impide llamar a la API, así que el backend
 * vuelve a comprobar el rol en cada petición. Si alguien borra la guarda desde
 * las herramientas del navegador, lo único que consigue es ver una pantalla
 * vacía; los datos siguen protegidos por el servidor.
 */
import { inject } from '@angular/core';
import { Router, type CanActivateFn, type UrlTree } from '@angular/router';

import { puede } from '../auth/roles';
import type { Rol } from '../models';
import { AuthService } from '../services/auth.service';

/** Exige que haya sesión. Guarda la ruta pretendida para volver tras entrar. */
export const autenticadoGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  if (auth.autenticado()) {
    return true;
  }
  return aLogin(inject(Router), state.url);
};

/**
 * Exige un rol mínimo. Es una fábrica, así que en la tabla de rutas se escribe
 * `canActivate: [rolGuard('ADMIN')]` y Angular lo invoca al activar.
 */
export function rolGuard(minimo: Rol): CanActivateFn {
  return (route, state) => {
    const auth = inject(AuthService);
    if (puede(auth.rol(), minimo)) {
      return true;
    }
    const router = inject(Router);
    return auth.autenticado() ? router.createUrlTree(['/sin-permiso']) : aLogin(router, state.url);
  };
}

/**
 * Redirige al login conservando el destino.
 *
 * `returnUrl` es lo que permite que tras iniciar sesión el usuario continúe
 * donde estaba. Sin él, entrar te deja siempre en la portada y perderías el
 * enlace, el artículo o la ficha que estabas mirando.
 */
function aLogin(router: Router, url: string): UrlTree {
  return router.createUrlTree(['/cuenta/entrar'], {
    queryParams: url === '/' ? {} : { returnUrl: url },
  });
}
