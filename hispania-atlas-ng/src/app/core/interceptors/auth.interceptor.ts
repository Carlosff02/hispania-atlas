/**
 * src/app/core/interceptors/auth.interceptor.ts
 *
 * Añade la cabecera `Authorization` a las peticiones y cierra la sesión cuando
 * el servidor responde 401.
 *
 * Equivalente Angular de un middleware de autenticación en React. La diferencia
 * es el punto de enganche: en React era envolver el `fetch`; aquí es una función
 * que se registra en `provideHttpClient` y que envuelve cada petición que sale
 * por `HttpClient`. No hay que acordarse de pasar por ella, que es justo el
 * error que cometería una implementación con `fetch` suelto.
 */
import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Rutas que devuelven 401 de forma legítima.
 *
 * Sin esta excepción, un login fallido por contraseña equivocada dispararía el
 * cierre de sesión y una redirección: el usuario vería "sesión cerrada" en
 * lugar de "usuario o contraseña incorrectos", y además perdería lo que hubiera
 * escrito en el formulario.
 */
const RUTAS_PUBLICAS = ['/auth/login', '/auth/registro'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  /*
   * El Router se resuelve AQUÍ, no dentro del `catchError`.
   *
   * `inject()` solo funciona dentro de un contexto de inyección, y el
   * proyector de `catchError` se ejecuta más tarde, cuando la respuesta ya ha
   * llegado: ese momento ya no es un contexto de inyección, y llamarlo ahí
   * lanza NullInjectorError. El cuerpo del interceptor sí lo es, porque se
   * ejecuta al construir la petición.
   */
  const router = inject(Router);

  const conToken =
    token !== null
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(conToken).pipe(
    catchError((error: unknown) => {
      const es401 = error instanceof HttpErrorResponse && error.status === 401;
      const esLogin = RUTAS_PUBLICAS.some((ruta) => req.url.includes(ruta));

      if (es401 && !esLogin) {
        auth.logout();
        void router.navigateByUrl('/cuenta/entrar');
      }

      return throwError(() => error);
    }),
  );
};
