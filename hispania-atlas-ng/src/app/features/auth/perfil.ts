/**
 * src/app/features/auth/perfil.ts
 *
 * Ficha de la cuenta propia. Equivalente de `features/auth/Profile.tsx`.
 *
 * Existe sobre todo por el aviso de caducidad. El token dura unas horas y su
 * caducidad no es un campo que el backend devuelva de forma útil, así que se
 * guarda la marca de tiempo del último login y se cuenta hacia atrás. Es una
 * estimación: el reloj del navegador puede estar desfasado. Para un dato que
 * decide cuándo conviene volver a entrar, vale; para medir la sesión con
 * precisión, no, y para eso haría falta devolver la expiración en cada
 * respuesta.
 */
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ETIQUETA_ROL } from '../../core/auth/roles';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [DatePipe],
  templateUrl: './perfil.html',
})
export class Perfil {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly usuario = this.auth.usuario;

  /** Momento en que se obtuvo la sesión, para estimar cuándo caduca. */
  private readonly desde = signal<number>(Date.now());

  protected readonly caducaEn = computed(() => {
    const fecha = new Date(this.desde() + 8 * 60 * 60 * 1000);
    return fecha.toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  });

  protected etiquetaRol(): string {
    const rol = this.auth.rol();
    return rol === null ? '' : ETIQUETA_ROL[rol];
  }

  protected salir(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/cuenta/entrar');
  }
}
