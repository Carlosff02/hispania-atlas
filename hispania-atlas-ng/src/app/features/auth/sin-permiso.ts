/**
 * src/app/features/auth/sin-permiso.ts
 *
 * Pantalla de acceso denegado. Sale cuando el usuario sí ha iniciado sesión pero
 * su rol no llega al mínimo de la ruta.
 *
 * Es distinta del 403 del backend a propósito: aquí el usuario ha hecho todo lo
 * correcto, solo le falta permiso. Enseñarle un error de servidor lo haría
 * pensar que algo se rompió.
 */
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ETIQUETA_ROL } from '../../core/auth/roles';

@Component({
  selector: 'app-sin-permiso',
  imports: [RouterLink],
  template: `
    <div
      class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-vicblue-dark"
    >
      <div
        class="max-w-md text-center bg-vicblue border border-brass/40 rounded-sm px-8 py-10"
      >
        <p class="font-display text-5xl text-brass-light font-bold">403</p>
        <h1 class="mt-3 text-lg text-paper-light font-bold">No tienes permiso aquí</h1>
        <p class="mt-2 text-sm text-paper-dark">
          Tu rol actual es
          <span class="text-brass-light font-semibold">{{ etiquetaRol() }}</span
          >, y esta sección pide un rango superior. Pídeselo a un administrador si
          crees que debería estar disponible.
        </p>
        <a
          routerLink="/explorar"
          class="inline-block mt-6 px-5 py-2.5 bg-brass text-vicblue font-bold text-sm tracking-[0.15em] uppercase rounded-sm hover:bg-brass-light transition-colors"
        >
          Volver al mapa
        </a>
      </div>
    </div>
  `,
})
export class SinPermiso {
  private readonly auth = inject(AuthService);

  protected etiquetaRol(): string {
    const rol = this.auth.rol();
    return rol === null ? 'desconocido' : ETIQUETA_ROL[rol];
  }
}
