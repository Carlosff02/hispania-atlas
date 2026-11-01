import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { LucideCompass } from '@lucide/angular';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { AccountMenu } from './account-menu';
import { SearchBox } from './search-box';

interface NavItem {
  path: string;
  label: string;
}

/**
 * Navegación de contenido: solo lo público.
 *
 * Las secciones con sesión (propuestas, moderación, administración) NO van
 * aquí, sino dentro del menú de cuenta. Dos motivos: esta barra es para
 * recorrer el atlas, y mezclar una zona de gestión con "Bellas Artes" o
 * "Economía" mezcla dos cosas de naturaleza distinta; y un enlace que aparece y
 * desaparece según el rol hace que la barra cambie de ancho entre sesiones.
 */
const NAV_ITEMS: NavItem[] = [
  { path: '/explorar', label: 'Cartografía' },
  { path: '/arte', label: 'Bellas Artes' },
  { path: '/hitos', label: 'Anales Históricos' },
  { path: '/cultura', label: 'Patrimonio Cultural' },
  { path: '/datos', label: 'Economía' },
];

/**
 * Barra de navegación superior. Equivalente de `layout/Header.tsx`.
 *
 * Sobre el estado activo: en React se usaba la forma de función de `NavLink`,
 * `className={({ isActive }) => ...}`, que devuelve una u otra lista de clases
 * según la ruta. En Angular NO se usa `routerLinkActive` a propósito: ese
 * directiva agrega clases encima de las que ya tiene el elemento, y como
 * `text-paper-dark` y `text-brass-light` son dos utilidades del mismo grupo de
 * Tailwind (misma especificidad), ganaría siempre la que saliera última en el
 * CSS generado, no la que corresponde. Calcular el estado con el router y
 * devolver la lista completa con `[ngClass]` evita ese problema, porque en todo
 * momento hay una sola de las dos clases de color.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, NgClass, LucideCompass, SearchBox, AccountMenu],
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router);

  protected readonly navItems = NAV_ITEMS;

  protected readonly linkBase =
    'px-3 py-1.5 text-[14px] font-bold rounded-sm border-b-2 transition-all duration-300';
  protected readonly linkInactive =
    'text-paper-dark hover:text-paper-light border-transparent hover:border-brass/50';
  protected readonly linkActive = 'bg-brass/20 text-brass-light border-brass';

  /* URL actual reactiva: se reevalúa en cada NavigationEnd. */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly isExplorar = computed(() => this.url() === '/explorar');

  protected isActive(path: string): boolean {
    return this.url() === path;
  }

  protected desktopLinkClass(path: string): string {
    return `${this.linkBase} ${this.isActive(path) ? this.linkActive : this.linkInactive}`;
  }

  protected mobileLinkClass(path: string): string {
    const base = 'px-3 py-1.5 mt-2 text-xs font-bold whitespace-nowrap';
    return this.isActive(path)
      ? `${base} text-brass-light`
      : `${base} text-paper-dark hover:text-paper-light`;
  }
}
