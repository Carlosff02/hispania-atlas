import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { LucideSearch } from '@lucide/angular';
import { Router } from '@angular/router';

import { AppStore } from '../../core/state/app.store';
import { etiquetaCategoria } from '../../core/ui/labels';
import type { Lugar, Pais } from '../../core/models';

/** Resultado unificado: el buscador mezcla naciones y lugares en una lista. */
type Resultado =
  | { tipo: 'pais'; pais: Pais }
  | { tipo: 'lugar'; lugar: Lugar };

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
 *
 * Teclado: Escape cierra el desplegable, las flechas recorren los resultados y
 * Enter abre el resaltado. Sin esto el combo solo se podía usar con ratón, que
 * es la parte del patrón ARIA `combobox` que más se olvida.
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

  /** Índice resaltado dentro de la lista; -1 significa "ninguno". */
  protected readonly activo = signal(-1);

  private readonly q = computed(() => this.query().trim().toLowerCase());

  protected readonly etiquetaCategoria = etiquetaCategoria;

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

  /** Los dos grupos en el orden en que se pintan, para navegar con flechas. */
  protected readonly resultados = computed<Resultado[]>(() => [
    ...this.matchedCountries().map((pais): Resultado => ({ tipo: 'pais', pais })),
    ...this.matchedPlaces().map((lugar): Resultado => ({ tipo: 'lugar', lugar })),
  ]);

  /** Con 2+ caracteres escritos, el desplegable debe verse (o no, si no hay resultados). */
  protected readonly showResults = computed(
    () => this.open() && this.q().length >= 2,
  );

  protected readonly hasResults = computed(() => this.resultados().length > 0);

  /* ----------------------------- Eventos ------------------------------- */

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.open.set(true);
    this.activo.set(-1);
  }

  protected onFocus(): void {
    this.open.set(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.open.set(false);
          this.activo.set(-1);
        }
        return;
      case 'ArrowDown':
        if (!this.showResults()) return;
        event.preventDefault();
        this.mover(1);
        return;
      case 'ArrowUp':
        if (!this.showResults()) return;
        event.preventDefault();
        this.mover(-1);
        return;
      case 'Enter': {
        if (!this.showResults() || !this.hasResults()) return;
        event.preventDefault();
        const indice = this.activo() >= 0 ? this.activo() : 0;
        this.abrirResultado(this.resultados()[indice]);
        return;
      }
      default:
        return;
    }
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
      this.activo.set(-1);
    }
  }

  /* ----------------------------- Acciones ------------------------------ */

  private mover(delta: number): void {
    const total = this.resultados().length;
    if (total === 0) return;
    const actual = this.activo();
    // Al bajar desde -1 se empieza en 0; al subir desde -1 se empieza en el final.
    const siguiente =
      actual < 0
        ? delta > 0
          ? 0
          : total - 1
        : (actual + delta + total) % total;
    this.activo.set(siguiente);
  }

  protected abrirResultado(resultado: Resultado): void {
    if (resultado.tipo === 'pais') {
      this.seleccionarPais(resultado.pais);
    } else {
      this.seleccionarLugar(resultado.lugar);
    }
  }

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
    this.activo.set(-1);
    void this.router.navigateByUrl('/explorar');
  }
}
