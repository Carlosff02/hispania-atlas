import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AppStore } from '../../core/state/app.store';
import { ExpressionsService } from '../../core/services/expressions.service';
import { etiquetaCategoria } from '../../core/ui/labels';
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
  protected readonly busqueda = signal('');
  protected readonly byCode = this.store.byCode;

  protected readonly etiquetaCategoria = etiquetaCategoria;

  protected readonly expresiones = toSignal(this.expressionsService.expresiones$, {
    initialValue: [] as ExpresionCultural[],
  });

  /** Estado real de la petición de expresiones: cargando, error o lista. */
  protected readonly cargandoExpresiones = toSignal(this.expressionsService.cargando$, {
    initialValue: true,
  });
  protected readonly errorExpresiones = toSignal(this.expressionsService.errorCarga$, {
    initialValue: false,
  });

  private readonly texto = computed(() => this.busqueda().trim().toLowerCase());

  protected readonly lugaresFiltrados = computed(() => {
    const f = this.filtro();
    const q = this.texto();
    return this.store.places().filter((p) => {
      const cumpleCategoria = f === 'TODOS' || p.category === f;
      if (!cumpleCategoria) return false;
      if (q === '') return true;
      const pais = this.paisDe(p.country) ?? '';
      return [p.name, p.desc, p.period, pais, etiquetaCategoria(p.category)]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  });

  protected readonly expresionesFiltradas = computed(() => {
    const f = this.filtro();
    const q = this.texto();
    const all = this.expresiones();
    const porCategoria = (e: ExpresionCultural): boolean => {
      if (f === 'TODOS') return true;
      if (f === 'GASTRONOMICO') return e.categoria === 'GASTRONOMIA';
      if (f === 'ARTE') return e.categoria === 'PINTURA' || e.categoria === 'ESCULTURA';
      if (f === 'DANZA') return e.categoria === 'DANZA' || e.categoria === 'MUSICA';
      return false;
    };
    return all.filter((e) => {
      if (!porCategoria(e)) return false;
      if (q === '') return true;
      return [e.titulo, e.desc, e.paisNombre, e.categoriaLabel]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  });

  protected readonly totalResultados = computed(
    () => this.lugaresFiltrados().length + this.expresionesFiltradas().length,
  );

  protected readonly hayFiltros = computed(
    () => this.filtro() !== 'TODOS' || this.busqueda().trim() !== '',
  );

  /** Error combinado: el de las expresiones o el de la carga inicial del store. */
  protected readonly hayErrorCarga = computed(
    () => this.errorExpresiones() || this.store.loadError() !== null,
  );

  protected setFiltro(cat: FiltroCategoria): void {
    this.filtro.set(cat);
  }

  protected setTab(tab: TabPatrimonio): void {
    this.tabActiva.set(tab);
  }

  protected limpiarFiltros(): void {
    this.filtro.set('TODOS');
    this.busqueda.set('');
  }

  protected recargar(): void {
    this.expressionsService.recargar();
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
