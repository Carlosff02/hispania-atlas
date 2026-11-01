import { Component, inject } from '@angular/core';

import { AppStore } from '../../core/state/app.store';
import { CountryPanel } from './country-panel';
import { MapView } from './map-view';

/**
 * Contenedor de la vista de cartografía. Equivalente de `map/ExplorarView.tsx`.
 *
 * Es un compositor: el mapa ocupa todo el espacio y el panel flota encima. La
 * altura `h-[calc(100vh-4rem)]` descuenta la altura del header (h-16 = 4rem)
 * para que el mapa no quede por debajo del pliegue de la página.
 *
 * El indicador de carga no existía en React: allí los datos ya estaban en el
 * store para cuando se montaba la vista. Con datos asíncronos por HTTP sí
 * hay una ventana en la que el mapa aún no tiene países, y mostrarla evita
 * que parezca que el mapa está vacío o roto.
 */
@Component({
  selector: 'app-explorar-view',
  imports: [MapView, CountryPanel],
  templateUrl: './explorar-view.html',
})
export class ExplorarView {
  private readonly store = inject(AppStore);
  protected readonly loading = this.store.loading;
}
