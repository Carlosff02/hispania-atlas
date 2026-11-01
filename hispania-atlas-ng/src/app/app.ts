import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './shared/layout/header';

/**
 * Componente raíz. Sustituye a `App.tsx`.
 *
 * El bloque `<router-outlet>` es el equivalente de `<Routes>`: Angular no
 * necesita que le declaremos qué componente va en cada URL dentro de esta
 * plantilla (eso vive en `app.routes.ts`), solo el punto donde se pinta la
 * vista activa.
 *
 * Nota sobre la carga de datos: en React había un componente `<InitializeData />`
 * que se montaba aquí y disparaba el `useEffect` de carga. En Angular no hace
 * falta ningún componente para eso: el `AppStore` se crea bajo demanda al
 * inyectarlo, y su constructor ya pide países y lugares al backend.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
})
export class App {}
