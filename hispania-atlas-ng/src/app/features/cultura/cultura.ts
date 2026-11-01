import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

import { AppStore } from '../../core/state/app.store';
import type { CategoriaLugar } from '../../core/models';

/**
 * Filtro especial: 'TODOS' no es una categoría real, por eso el tipo de la
 * signal es la unión con 'TODOS'.
 */
export type FiltroCategoria = CategoriaLugar | 'TODOS';

export const CATEGORIAS: FiltroCategoria[] = [
  'TODOS',
  'ARTE',
  'DANZA',
  'ARQUEOLOGIA',
  'PATRIMONIO',
  'HISTORICO',
  'INFRAESTRUCTURA',
  'PAISAJE_NATURAL',
  'ACADEMICO',
  'GASTRONOMICO',
];

/**
 * Catálogo de patrimonio y academias. Equivalente de `cultura/Cultura.tsx`.
 *
 * El botón "Ubicar en Cartografía" hace DOS cosas distintas con dos
 * herramientas distintas, igual que en React: `store` para el estado
 * compartido (qué país y qué lugar están seleccionados, que es lo que leen
 * CountryPanel y PlaceCard) y `Router` para cambiar la URL. El store no navega
 * y el router no guarda estado.
 */
@Component({
  selector: 'app-cultura',
  imports: [NgClass],
  templateUrl: './cultura.html',
})
export class Cultura {
  private readonly store = inject(AppStore);
  private readonly router = inject(Router);

  protected readonly categorias = CATEGORIAS;
  protected readonly filtro = signal<FiltroCategoria>('TODOS');
  protected readonly byCode = this.store.byCode;

  protected readonly listaFiltrada = computed(() => {
    const f = this.filtro();
    const all = this.store.places();
    return f === 'TODOS' ? all : all.filter((p) => p.category === f);
  });

  protected setFiltro(cat: FiltroCategoria): void {
    this.filtro.set(cat);
  }

  protected filterClass(cat: FiltroCategoria): string {
    const base = 'px-4 py-1 text-[13px] border transition-all whitespace-nowrap';
    return this.filtro() === cat
      ? `${base} bg-vicblue text-paper-light border-ink font-bold`
      : `${base} bg-paper-light border-paper-border text-ink hover:bg-paper-dark`;
  }

  protected paisDe(codigo: string): string | undefined {
    return this.byCode()[codigo]?.name;
  }

  protected ubicarEnMapa(placeId: string): void {
    if (!this.store.locatePlace(placeId)) return;
    void this.router.navigateByUrl('/explorar');
  }
}
