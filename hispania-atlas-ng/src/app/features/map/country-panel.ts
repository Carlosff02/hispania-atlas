import { Component, computed, inject, linkedSignal } from '@angular/core';

import { AppStore } from '../../core/state/app.store';
import { PlaceCard } from './place-card';

/**
 * Cuántos chips de lugares se muestran antes de plegar. Peru tiene 14, asi que
 * sin esto el panel se convierte en un bloque de texto que hay que desplazar
 * para llegar a la ficha del lugar.
 */
const CHIPS_INICIALES = 6;

/**
 * Panel lateral con los datos del país seleccionado.
 * Equivalente de `map/CountryPanel.tsx`.
 *
 * El "guard clause" de React (`if (!country) return null`) se resuelve aquí con
 * `@if`: es la misma semántica, pero declarativa y sin salir del flujo de la
 * plantilla, así que Angular no pierde la información de tipos del resto del
 * marcado. Dentro del bloque, `country()` ya está estrechado a `Pais`, y por eso
 * no hace falta `!` ni `?.` en cada acceso.
 */
@Component({
  selector: 'app-country-panel',
  imports: [PlaceCard],
  templateUrl: './country-panel.html',
})
export class CountryPanel {
  private readonly store = inject(AppStore);

  protected readonly country = this.store.country;
  protected readonly lugaresDelPais = computed(() => {
    const c = this.store.country();
    if (!c) return [];
    return this.store.placesByCountry()[c.code] ?? [];
  });

  /**
   * `linkedSignal` en vez de un `signal(false)` + `effect` que lo reinicie: al
   * cambiar de pais, `lugaresDelPais()` se recalcula y el estado de "ver todos"
   * vuelve al valor derivado. Asi un pais con 3 lugares nunca hereda el
   * desplegado de uno con 14, sin codificar ese reinicio a mano.
   */
  protected readonly verTodos = linkedSignal(
    () => this.lugaresDelPais().length <= CHIPS_INICIALES,
  );

  /** Los chips que se pintan: todos si esta desplegado, los primeros N si no. */
  protected readonly visibles = computed(() => {
    const todos = this.lugaresDelPais();
    return this.verTodos() ? todos : todos.slice(0, CHIPS_INICIALES);
  });

  /** Cuantos quedan ocultos, para rotular el boton ("Ver mas (8)"). */
  protected readonly ocultos = computed(() =>
    Math.max(0, this.lugaresDelPais().length - this.visibles().length),
  );

  /** Solo hay boton cuando la lista supera el corte. */
  protected readonly hayMas = computed(() => this.lugaresDelPais().length > CHIPS_INICIALES);

  protected toggleVerTodos(): void {
    this.verTodos.update((v) => !v);
  }

  protected close(): void {
    this.store.clearSelection();
  }

  protected selectPlace(id: string): void {
    this.store.selectPlace(this.store.places().find((p) => p.id === id) ?? null);
  }
}
