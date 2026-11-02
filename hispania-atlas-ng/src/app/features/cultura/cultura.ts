import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AppStore } from '../../core/state/app.store';
import { ExpressionsService } from '../../core/services/expressions.service';
import type { CategoriaLugar, ExpresionCultural } from '../../core/models';

/**
 * Filtro especial: 'TODOS' no es una categoría real, por eso el tipo de la
 * signal es la unión con 'TODOS'.
 */
export type FiltroCategoria = CategoriaLugar | 'TODOS';

export const CATEGORIAS: FiltroCategoria[] = [
  'TODOS',
  'PATRIMONIO',
  'HISTORICO',
  'GASTRONOMICO',
  'ARTE',
  'DANZA',
  'ARQUEOLOGIA',
  'INFRAESTRUCTURA',
  'PAISAJE_NATURAL',
  'ACADEMICO',
];

export type TabPatrimonio = 'todos' | 'lugares' | 'expresiones';

/**
 * Catálogo unificado de patrimonio cultural, lugares históricos y tradiciones (HU-22 / RFC-001).
 *
 * Integra en una sola sección tanto los lugares físicos (con categorías PATRIMONIO,
 * GASTRONÓMICO, etc.) como las expresiones culturales y tradiciones inmateriales,
 * compartiendo filtros y componentes sin duplicar código.
 */
@Component({
  selector: 'app-cultura',
  imports: [NgClass],
  templateUrl: './cultura.html',
})
export class Cultura {
  private readonly store = inject(AppStore);
  private readonly router = inject(Router);
  private readonly expressionsService = inject(ExpressionsService);

  protected readonly categorias = CATEGORIAS;
  protected readonly filtro = signal<FiltroCategoria>('TODOS');
  protected readonly tabActiva = signal<TabPatrimonio>('todos');
  protected readonly byCode = this.store.byCode;

  protected readonly expresiones = toSignal(this.expressionsService.expresiones$, {
    initialValue: [] as ExpresionCultural[],
  });

  protected readonly lugaresFiltrados = computed(() => {
    const f = this.filtro();
    const all = this.store.places();
    return f === 'TODOS' ? all : all.filter((p) => p.category === f);
  });

  protected readonly expresionesFiltradas = computed(() => {
    const f = this.filtro();
    const all = this.expresiones();
    if (f === 'TODOS') return all;
    if (f === 'GASTRONOMICO') {
      return all.filter((e) => e.categoria === 'GASTRONOMIA');
    }
    if (f === 'ARTE') {
      return all.filter((e) => ['PINTURA', 'ESCULTURA'].includes(e.categoria));
    }
    if (f === 'DANZA') {
      return all.filter((e) => ['DANZA', 'MUSICA'].includes(e.categoria));
    }
    return [];
  });

  protected setFiltro(cat: FiltroCategoria): void {
    this.filtro.set(cat);
  }

  protected setTab(tab: TabPatrimonio): void {
    this.tabActiva.set(tab);
  }

  protected filterClass(cat: FiltroCategoria): string {
    const base = 'px-4 py-1 text-[13px] border transition-all whitespace-nowrap cursor-pointer';
    return this.filtro() === cat
      ? `${base} bg-vicblue text-paper-light border-ink font-bold shadow-sm`
      : `${base} bg-paper-light border-paper-border text-ink hover:bg-paper-dark`;
  }

  protected tabClass(tab: TabPatrimonio): string {
    const base = 'px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer';
    return this.tabActiva() === tab
      ? `${base} border-vicblue text-vicblue bg-vicblue/5`
      : `${base} border-transparent text-ink-muted hover:text-ink`;
  }

  protected paisDe(codigo: string): string | undefined {
    return this.byCode()[codigo]?.name;
  }

  protected ubicarEnMapa(placeId: string): void {
    if (!this.store.locatePlace(placeId)) return;
    void this.router.navigateByUrl('/explorar');
  }
}
