import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { AppStore } from '../../core/state/app.store';
import { milestones } from '../../core/data/milestones';
import type { Hito, TipoHito } from '../../core/models';

const CATEGORIAS: (TipoHito | 'Todos')[] = ['Todos', 'Historia', 'Arte', 'Infraestructura'];

/**
 * Cronología de hitos. Equivalente de `hitos/Milestones.tsx`.
 *
 * Aquí el filtro y el hito seleccionado son estado LOCAL (`signal` del
 * componente), a diferencia del filtro de ArteGrid que vive en el store global.
 * Es la misma decisión de diseño que tomaba el proyecto React: si nadie más
 * fuera de esta vista necesita el dato, ensuciar el store global solo agrega
 * superficie a mantener.
 */
@Component({
  selector: 'app-milestones',
  imports: [NgClass],
  templateUrl: './milestones.html',
})
export class Milestones {
  private readonly store = inject(AppStore);

  protected readonly categorias = CATEGORIAS;
  protected readonly filtro = signal<TipoHito | 'Todos'>('Todos');
  protected readonly seleccionado = signal<Hito | null>(milestones[0] ?? null);

  protected readonly listaFiltrada = computed(() =>
    this.filtro() === 'Todos' ? milestones : milestones.filter((m) => m.type === this.filtro()),
  );

  protected readonly byCode = this.store.byCode;

  protected setFiltro(cat: TipoHito | 'Todos'): void {
    this.filtro.set(cat);
  }

  protected seleccionar(hito: Hito): void {
    this.seleccionado.set(hito);
  }

  protected filterClass(cat: TipoHito | 'Todos'): string {
    const base = 'px-4 py-1 text-[13px] border transition-all whitespace-nowrap';
    return this.filtro() === cat
      ? `${base} bg-brass text-ink border-ink font-bold`
      : `${base} bg-paper-light border-paper-border text-ink hover:bg-paper-dark`;
  }

  /** Nombre del país de un hito, o cadena vacía si el código no existe. */
  protected paisDe(hito: Hito): string {
    return this.byCode()[hito.country]?.name ?? '';
  }
}
