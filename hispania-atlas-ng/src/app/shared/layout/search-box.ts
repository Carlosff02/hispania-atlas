import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { LucideSearch } from '@lucide/angular';
import { Router } from '@angular/router';

import { AppStore } from '../../core/state/app.store';
import type { Lugar, Pais } from '../../core/models';

/**
 * Buscador de países y lugares. Equivalente de `layout/SearchBox.tsx`.
 *
 * Traducciones de los patrones de React a Angular:
 *
 *  - `useState`           -> `signal()`. Se lee `query()` y se escribe
 *                           `query.set(...)`; en la plantilla se llama igual.
 *  - `useMemo`            -> `computed()`. La diferencia clave: no hay que
 *                           declarar el array de dependencias a mano, Angular
 *                           las deduce leyendo qué signals lees dentro. Aquí
 *                           no puede quedar desactualizado.
 *  - `useNavigate`        -> `inject(Router)` + `router.navigateByUrl()`.
 *  - input controlado     -> `[value]` + `(input)`. Es el mismo modelo que
 *                           `[(ngModel)]`, pero sin importar FormsModule para
 *                           un solo campo.
 *  - `useEffect` de       -> `@HostListener('document:mousedown')`. Angular
 *    clic fuera             añade y quita el listener solo por el ciclo de vida
 *                           del componente, así que no hay limpieza manual que
 *                           olvidar (ni fuga de memoria si se olvida).
 */
@Component({
  selector: 'app-search-box',
  imports: [LucideSearch],
  templateUrl: './search-box.html',
})
export class SearchBox {
  private readonly store = inject(AppStore);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly query = signal('');
  protected readonly open = signal(false);

  private readonly q = computed(() => this.query().trim().toLowerCase());

  /**
   * `computed` con cadena de dependencia: mientras el texto tenga menos de dos
   * caracteres no se filtra nada, igual que el `if (q.length < 2)` del original.
   */
  protected readonly matchedCountries = computed<Pais[]>(() => {
    const q = this.q();
    if (q.length < 2) return [];
    return this.store
      .countries()
      .filter((c) => c.name.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q));
  });

  protected readonly matchedPlaces = computed<Lugar[]>(() => {
    const q = this.q();
    if (q.length < 2) return [];
    return this.store.places().filter((p) => p.name.toLowerCase().includes(q));
  });

  /** Con 2+ caracteres escritos, el desplegable debe verse (o no, si no hay resultados). */
  protected readonly showResults = computed(
    () => this.open() && this.q().length >= 2,
  );

  protected readonly hasResults = computed(
    () => this.matchedCountries().length > 0 || this.matchedPlaces().length > 0,
  );

  /* ----------------------------- Eventos ------------------------------- */

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.open.set(true);
  }

  protected onFocus(): void {
    this.open.set(true);
  }

  /**
   * Cierra el desplegable al hacer clic fuera del componente. El listener vive
   * en `document`, así que hay que comprobar que el destino del evento esté
   * dentro de nuestro propio elemento antes de cerrar.
   */
  @HostListener('document:mousedown', ['$event'])
  protected onDocumentMouseDown(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  /* ----------------------------- Acciones ------------------------------ */

  protected seleccionarPais(pais: Pais): void {
    this.store.selectCountry(pais);
    this.reset();
  }

  protected seleccionarLugar(lugar: Lugar): void {
    // El lugar manda en la selección: primero el país que lo contiene (para el
    // panel) y después el lugar, porque `selectCountry` limpia el lugar.
    this.store.selectCountryAndPlace(this.store.byCode()[lugar.country] ?? null, lugar);
    this.reset();
  }

  private reset(): void {
    this.query.set('');
    this.open.set(false);
    void this.router.navigateByUrl('/explorar');
  }
}
