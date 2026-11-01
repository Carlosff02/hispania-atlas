/**
 * src/app/core/state/app.store.ts
 *
 * Store global de la aplicación. Es el equivalente directo del
 * `Context + useReducer` de `state/AppContext.tsx` en la versión React.
 *
 * Tabla de equivalencias:
 *
 *   React                          Angular
 *   ──────────────────────────────  ──────────────────────────────────────
 *   <AppProvider>                  AppStore (providedIn: 'root')
 *   useReducer(reducer, initial)   signal() + métodos de acción
 *   dispatch({type, payload})      store.selectCountry(pais)
 *   useApp()                       inject(AppStore)
 *   re-render por cambio de estado -tracking de signals en la plantilla
 *
 * La diferencia conceptual importante: en React el estado era un objeto
 * inmutable y había que despachar un objeto `Action` para cambiarlo; aquí cada
 * pieza de estado es un `signal` de escritura privada con un setter público
 * tipado. No se necesitan ni actions ni reducer, y las acciones quedan
 * descubribles por autocompletado en vez de por una unión discriminada.
 *
 * Una ventaja extra frente al `useMemo` del proyecto React: los índices
 * derivados (`byCode`, `placesByCountry`) se calculan UNA vez aquí con
 * `computed`, en lugar de repetirse en cada componente que los necesite.
 */
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { CountriesService } from '../services/countries.service';
import { PlacesService } from '../services/places.service';
import type { LayerId, Lugar, Pais } from '../models';

@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly countriesService = inject(CountriesService);
  private readonly placesService = inject(PlacesService);

  /* ----------------------------- Estado (privado) ----------------------- */

  private readonly _countries = signal<Pais[]>([]);
  private readonly _country = signal<Pais | null>(null);
  private readonly _place = signal<Lugar | null>(null);
  private readonly _places = signal<Lugar[]>([]);
  private readonly _artFilter = signal<string>('Todos');
  private readonly _layerId = signal<LayerId>('political');
  private readonly _loading = signal(true);
  private readonly _loadError = signal<Error | null>(null);

  /* --------------------- Estado expuesto (solo lectura) ----------------- */
  /* `asReadonly()` bloquea la escritura desde los componentes: los cambios
     solo pueden pasar por los métodos de acción de más abajo. Es el equivalente
     funcional de no exportar el `dispatch` sin tipar. */

  readonly countries = this._countries.asReadonly();
  readonly country = this._country.asReadonly();
  readonly place = this._place.asReadonly();
  readonly places = this._places.asReadonly();
  readonly artFilter = this._artFilter.asReadonly();
  readonly layerId = this._layerId.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loadError = this._loadError.asReadonly();

  /* ----------------------------- Derivados ------------------------------ */

  /** Índice país por código, para resolver `porPais[code]` en O(1). */
  readonly byCode = computed<Record<string, Pais>>(() =>
    Object.fromEntries(this._countries().map((c) => [c.code, c])),
  );

  /** Índice de lugares agrupados por código de país. */
  readonly placesByCountry = computed<Record<string, Lugar[]>>(() => {
    const index: Record<string, Lugar[]> = {};
    for (const lugar of this._places()) {
      (index[lugar.country] ??= []).push(lugar);
    }
    return index;
  });

  /* ------------------------------ Acciones ------------------------------ */

  /**
   * Al elegir un país se deselecciona el lugar, igual que el `case
   * 'SELECT_COUNTRY'` del reducer original: los dos son "el detalle que se está
   * viendo", y mantenerlos sincronizados evita que PlaceCard muestre un lugar de
   * un país distinto al del panel.
   */
  selectCountry(pais: Pais | null): void {
    this._country.set(pais);
    this._place.set(null);
  }

  selectPlace(lugar: Lugar | null): void {
    this._place.set(lugar);
  }

  /** Selecciona país y lugar a la vez (usado por la búsqueda y por Cultura). */
  selectCountryAndPlace(pais: Pais | null, lugar: Lugar | null): void {
    this._country.set(pais);
    this._place.set(lugar);
  }

  setArtFilter(categoria: string): void {
    this._artFilter.set(categoria);
  }

  setLayer(layer: LayerId): void {
    this._layerId.set(layer);
  }

  /** Cierra el panel del país (botón `×` de CountryPanel). */
  clearSelection(): void {
    this._country.set(null);
    this._place.set(null);
  }

  /**
   * Resuelve un lugar completo: busca su país en el índice y selecciona ambos.
   * Devuelve `false` si el lugar no existe, para que la vista decida qué hacer.
   */
  locatePlace(placeId: string): boolean {
    const lugar = this._places().find((p) => p.id === placeId);
    if (!lugar) {
      return false;
    }
    this.selectCountryAndPlace(this.byCode()[lugar.country] ?? null, lugar);
    return true;
  }

  /**
   * Vuelve a pedir los lugares al backend y sustituye la lista en memoria.
   *
   * Existe porque la carga del constructor ocurre UNA vez y `places$` está
   * cacheado con `shareReplay`: sin esta acción, un alta o un borrado hecho en la
   * pantalla de gestión no se verían hasta recargar la página entera.
   *
   * Devuelve la lista ya actualizada para que quien la llamó pueda seguir
   * trabajando con ella sin tener que leer el signal otra vez. Si la petición
   * falla, el error sube y la lista anterior se conserva intacta: es preferible
   * mostrar datos viejos a dejar la pantalla vacía.
   */
  async recargarLugares(): Promise<Lugar[]> {
    const lugares = await this.placesService.recargar();
    this._places.set(lugares);

    /*
     * Si el lugar abierto era el que se acaba de borrar, el detalle se queda
     * colgado en un objeto que ya no está en ninguna parte. Comprobarlo aquí, en
     * el store y no en la vista, evita que la ficha siga mostrando un lugar
     * inexistente mientras el panel del país ya no lo encuentre en la lista.
     */
    const abierto = this._place();
    if (abierto !== null && !lugares.some((l) => l.id === abierto.id)) {
      this._place.set(null);
    }

    return lugares;
  }

  /* --------------------------- Carga inicial ---------------------------- */

  /**
   * Sustituye a `<InitializeData />`: se ejecuta una única vez al crear el store
   * (root, así que dura lo que la app) y en paralelo en lugar de secuencialmente
   * como hacía el `await` encadenado de la versión React.
   */
  constructor() {
    forkJoin({
      countries: this.countriesService.countries$,
      places: this.placesService.places$,
    })
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe({
        next: ({ countries, places }) => {
          this._countries.set(countries);
          this._places.set(places);
          this._loading.set(false);
          console.info(
            `✅ ${countries.length} países y ${places.length} lugares cargados`,
          );
        },
        error: (err: Error) => {
          this._loadError.set(err);
          this._loading.set(false);
          console.error('Error cargando datos:', err);
        },
      });
  }
}

/*
 * NOTAS DE MIGRACIÓN — acciones del reducer React que quedaron sin uso y por
 * eso no se replicaron aquí. Si las necesitas, se re-agregan en dos líneas:
 *
 *   SET_VIEW   state.view        lo reemplaza el Router (`router.url`)
 *   SET_MILE_FILTER  mileFilter  la vista Hitos usa estado local para su filtro
 *   SET_CULT_FILTER  cultFilter  la vista Cultura usa estado local para el suyo
 *   TOGGLE_DATA_COUNTRY             la vista Datos mantiene su propia selección
 *                                    de países e indicador en signals locales
 *
 * En el proyecto React esas acciones ya estaban definidas pero ningún
 * componente las despachaba, así que omitirlas no cambia ningún comportamiento.
 * `layerId` sí se conserva porque tiene su tipo propio (`LayerId`/`CapaMapa`)
 * y sirve de bandera para el selector de capas del mapa.
 */
