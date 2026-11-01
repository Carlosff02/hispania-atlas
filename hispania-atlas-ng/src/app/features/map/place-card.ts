import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';

import { AppStore } from '../../core/state/app.store';

/**
 * Ficha del lugar seleccionado dentro del panel de país.
 * Equivalente de `map/PlaceCard.tsx`.
 *
 * Se auto-gestiona: lee el lugar del store y decide si mostrarse, igual que
 * hacía la versión React. Por eso no recibe ningún `@Input()`.
 */
@Component({
  selector: 'app-place-card',
  templateUrl: './place-card.html',
})
export class PlaceCard {
  private readonly store = inject(AppStore);

  protected readonly place = this.store.place;

  private readonly card = viewChild<ElementRef<HTMLElement>>('card');

  constructor() {
    /**
     * La ficha vive DEBAJO de la lista de chips, asi que en paises con mucho
     * patrimonio (Peru tiene 14) al hacer click en un chip la ficha queda fuera
     * de pantalla. Sin este scroll el usuario no ve que ha cambiado nada.
     *
     * El `requestAnimationFrame` espera al pintado: el `@if` de la plantilla
     * todavia no ha creado el elemento cuando el efecto se ejecuta, y
     * `viewChild` devolveria `undefined`.
     *
     * `block: 'nearest'` minimiza el desplazamiento, y `behavior: 'smooth'` lo
     * hace legible en lugar de un salto seco.
     */
    effect(() => {
      if (!this.place()) return;

      requestAnimationFrame(() => {
        this.card()?.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      });
    });
  }

  protected close(): void {
    this.store.selectPlace(null);
  }
}
