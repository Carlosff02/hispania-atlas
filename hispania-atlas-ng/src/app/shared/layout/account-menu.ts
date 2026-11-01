/**
 * src/app/shared/layout/account-menu.ts
 *
 * Zona de cuenta de la cabecera. Equivalente del bloque de sesión de
 * `layout/Header.tsx`.
 *
 * Se extrae del componente `Header` en lugar de meterlo ahí porque tiene
 * estado propio (el desplegable) y porque se puede reutilizar en la vista móvil
 * sin arrastrar la navegación entera. La cabecera le pasa el token y el estado
 * del desplegable; el menú no necesita conocer la barra de navegación.
 */
import { Component, ElementRef, computed, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ETIQUETA_ROL, puede } from '../../core/auth/roles';
import type { Rol } from '../../core/models';

interface MenuItem {
  path: string;
  label: string;
  /** Rol mínimo para que la opción aparezca. `null` es visible para cualquiera. */
  minimo: Rol | null;
}

/**
 * Secciones con sesión.
 *
 * Van aquí y no en la barra de navegación principal, porque la barra es para
 * recorrer el atlas: mezclar "Moderar propuestas" con "Bellas Artes" pone dos
 * cosas de naturaleza distinta en el mismo sitio, y encima un enlace que
 * aparece según el rol hace que la barra cambie entre sesiones.
 *
 * Ocultar una opción es comodidad, no seguridad: el backend comprueba el rol en
 * cada petición, y la ruta lleva su propia `rolGuard`. Alguien que la abra a
 * mano desde la consola llega a `/sin-permiso`, no a los datos.
 */
const MENU_ITEMS: MenuItem[] = [
  { path: '/cuenta', label: 'Mi cuenta', minimo: null },
  { path: '/propuestas', label: 'Mis propuestas', minimo: null },
  { path: '/lugares', label: 'Gestionar lugares', minimo: 'COLABORADOR' },
  { path: '/propuestas/moderar', label: 'Moderar propuestas', minimo: 'COLABORADOR' },
  { path: '/admin/usuarios', label: 'Administrar cuentas', minimo: 'ADMIN' },
];

@Component({
  selector: 'app-account-menu',
  imports: [RouterLink],
  templateUrl: './account-menu.html',
  // Cierra el desplegable al pulsar fuera. Se decide aquí, y no con un
  // `(click)` en el `<div>` de la plantilla, porque un contenedor con manejador
  // de clic no es accesible: no tiene foco ni se puede activar con el teclado,
  // y el linter lo rechaza. Comparando el destino del clic con este elemento
  // no hace falta ni Propagation.stop.
  host: { '(document:click)': 'cerrarSiEstaFuera($event)' },
})
export class AccountMenu {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Avisa a la cabecera de que el móvil debe cerrar el menú de navegación. */
  readonly navegar = output<void>();

  protected readonly abierto = signal(false);

  protected readonly autenticado = this.auth.autenticado;
  protected readonly usuario = this.auth.usuario;

  /**
   * Opciones visibles para el rol actual.
   *
   * Se calcula con `computed` porque el rol cambia sin recargar: quien inicia
   * sesión y es colaborador ve aparecer "Moderar propuestas" en ese momento. Con
   * un array fijo en el constructor, el menú saldría vacío hasta recargar.
   */
  protected readonly items = computed(() => {
    const rol = this.auth.rol();
    return MENU_ITEMS.filter((item) => item.minimo === null || puede(rol, item.minimo));
  });

  protected alternar(): void {
    this.abierto.update((v) => !v);
  }

  protected cerrar(): void {
    this.abierto.set(false);
  }

  protected cerrarSiEstaFuera(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.cerrar();
    }
  }

  protected salir(): void {
    this.cerrar();
    this.auth.logout();
    void this.router.navigateByUrl('/explorar');
  }

  /** Se llama al navegar para que el desplegable no quede abierto. */
  protected alNavegar(): void {
    this.cerrar();
    this.navegar.emit();
  }

  protected etiquetaRol(): string {
    const rol = this.auth.rol();
    return rol === null ? '' : ETIQUETA_ROL[rol];
  }
}
