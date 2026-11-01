import { Component, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { AppStore } from '../../core/state/app.store';
import { ExpressionsService } from '../../core/services/expressions.service';
import type { CategoriaExpresion } from '../../core/models';
import { CATEGORIAS_EXPRESION_ORDEN } from '../../core/models';

/**
 * Rejilla de expresiones culturales. Equivalente de `arte/ArteGrid.tsx`.
 *
 * El filtro de categoría sí vive en el store global (y no como estado local
 * como en Hitos o Cultura) porque es el único filtro de la app que se decidió
 * compartir: así se conserva al navegar a otra ruta y volver.
 *
 * Los datos ya no vienen de una constante sino de `GET /api/expresiones`, así que
 * la lista es asíncrona y el filtro se arma sobre lo que llegó, no sobre lo que
 * había escrito en el archivo. Antes las categorías eran texto libre y el filtro
 * se construía con `new Set(artData.map(a => a.cat))`; ahora son las nueve del
 * enum, y se muestran solo las que tienen alguna expresión, para no ofrecer un
 * botón que devuelve una lista vacía.
 */
@Component({
  selector: 'app-arte-grid',
  imports: [NgClass],
  templateUrl: './arte-grid.html',
})
export class ArteGrid {
  private readonly store = inject(AppStore);
  private readonly expressionsService = inject(ExpressionsService);

  protected readonly artFilter = this.store.artFilter;

  private readonly expresiones = toSignal(this.expressionsService.expresiones$, {
    initialValue: [],
  });

  /**
   * Categorías presentes en los datos, en el orden del enum y no en el de
   * aparición. Solo las que tienen alguna expresión, para no ofrecer un botón
   * que devuelve una lista vacía.
   */
  protected readonly categorias = computed<(CategoriaExpresion | 'Todos')[]>(() => {
    const presentes = new Set(this.expresiones().map((e) => e.categoria));
    return ['Todos', ...CATEGORIAS_EXPRESION_ORDEN.filter((c) => presentes.has(c))];
  });

  protected readonly listaFiltrada = computed(() =>
    this.artFilter() === 'Todos'
      ? this.expresiones()
      : this.expresiones().filter((e) => e.categoria === this.artFilter()),
  );

  /**
   * Texto del botón. Para 'Todos' es la palabra; para el resto, la etiqueta
   * traducida. El store guarda el VALOR del enum, no lo que se pinta, y así el
   * filtro sobrevive a un cambio de idioma en las etiquetas.
   */
  protected label(cat: CategoriaExpresion | 'Todos'): string {
    if (cat === 'Todos') return cat;
    return this.expresiones().find((e) => e.categoria === cat)?.categoriaLabel ?? cat;
  }

  protected filterClass(cat: CategoriaExpresion | 'Todos'): string {
    const base = 'px-4 py-1.5 text-[13px] border transition-all';
    return this.artFilter() === cat
      ? `${base} bg-vicblue text-paper-light border-ink font-bold`
      : `${base} bg-paper-light border-paper-border text-ink hover:bg-paper-dark`;
  }

  protected selectFilter(cat: CategoriaExpresion | 'Todos'): void {
    this.store.setArtFilter(cat);
  }
}
