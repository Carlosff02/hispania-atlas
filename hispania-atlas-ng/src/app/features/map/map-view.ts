/**
 * src/app/features/map/map-view.ts
 *
 * Mapa Leaflet con Countries coropléticas. Equivalente de `map/MapView.tsx`.
 *
 * Esta es la parte de la migración donde más cambia el modelo mental, porque
 * React resuelve el "cuándo ejecutar código que depende de datos" con
 * `useEffect` + array de dependencias, y Angular tiene un modelo distinto:
 *
 *   React                              Angular
 *   ──────────────────────────────────  ───────────────────────────────────
 *   useEffect(fn, [])                 ngAfterViewInit()   (crear)
 *                                      ngOnDestroy()       (limpiar)
 *   useEffect(fn, [deps])              effect(() => ...)   (reaccionar)
 *   useState                           signal()            (estado)
 *   StrictMode monta 2 veces           ngAfterViewInit     corre 1 vez
 *
 * Se conservan los tres efectos del original para que el código sea
 * reconocible:
 *   1. crear el mapa y la capa de teselas  -> afterNextRender
 *   2. cargar el GeoJSON cuando hay países -> effect() sobre countries()
 *   3. resaltar el país y volar la cámara   -> effect() sobre country()
 *
 * El punto 3 necesita saber que el GeoJSON ya está pintado. En React se
 * resolvía con un `useState(mapReady)` que provocaba un re-render extra; aquí
 * un `signal` cumple el mismo papel, y como solo lo leen los `effect()` no
 * dispara ninguna detección de cambios.
 */
import {
  afterNextRender,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';

import { environment } from '../../../environments/environment';
import { AppStore } from '../../core/state/app.store';
import type { Pais } from '../../core/models';

const GEOJSON_URL =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson';

/** Países grandes: a zoom 5 quedan recortados en pantallas anchas. */
const WIDE_CODES = ['MX', 'AR', 'CL', 'BR'];

/*
 * Tipos del GeoJSON. Se declaran aquí a propósito en vez de importar
 * `@types/geojson`: ese paquete publica un UMD global (`export as namespace
 * GeoJSON`) y el tsconfig de Angular usa `"types": []`, que impide incluir
 * globales automáticamente. El subconjunto que really usamos del GeoJSON es
 * mínimo, así que declararlo es más simple que pelear con la configuración.
 */
interface GeoFeature {
  type: 'Feature';
  properties: Record<string, unknown> | null;
  geometry: unknown;
}

interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

function getCountryCode(
  props: Record<string, unknown> | null | undefined,
  byCode: Record<string, Pais>,
  countries: Pais[],
): string | null {
  if (!props) return null;

  // Acceso por corchetes obligatorio: el tsconfig de Angular tiene
  // `noPropertyAccessFromIndexSignature`, que prohíbe `props.ISO_A2`.
  const a2 = (props['ISO_A2'] ??
    props['ISO_A2_EH'] ??
    props['postal'] ??
    props['POSTAL']) as string | undefined;
  if (a2 && a2 !== '-99' && byCode[a2]) return a2;

  const name = (props['NAME'] ?? props['NAME_LONG'] ?? props['admin'] ?? '') as string;
  const lower = name.toLowerCase();
  for (const c of countries) {
    if (c.name.toLowerCase() === lower) return c.code;
  }
  return null;
}

function styleFor(
  code: string | null,
  selectedCountry: Pais | null,
  byCode: Record<string, Pais>,
): L.PathOptions {
  const c = code ? byCode[code] : null;
  if (!c) {
    return { fillColor: '#d6cdb8', color: '#a89d87', weight: 0.8, fillOpacity: 0.4 };
  }

  const isSelected = selectedCountry?.code === code;
  return {
    fillColor: c.color,
    color: isSelected ? '#1a1a1a' : '#4f4233',
    weight: isSelected ? 2.5 : 1.2,
    fillOpacity: isSelected ? 1 : 0.85,
  };
}

@Component({
  selector: 'app-map-view',
  template: '<div #container class="absolute inset-0"></div>',
  styles: ':host { display: block; position: absolute; inset: 0; }',
})
export class MapView implements OnDestroy {
  private readonly store = inject(AppStore);
  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private map: L.Map | null = null;
  private geoLayer: L.GeoJSON | null = null;

  /** El mapa ya está en el DOM y se pueden agregar capas. */
  private readonly viewReady = signal(false);
  /** El GeoJSON ya se pintó: se puede resaltar y volar la cámara. */
  private readonly geoReady = signal(false);

  /** Petición en vuelo, para cancelar una descarga que quedó obsoleta. */
  private geoRequest: AbortController | null = null;

  constructor() {
    // 1. Mapa + teselas. `afterNextRender` garantiza que el div ya existe en el
    //    documento (el equivalente a un efecto de montaje de React).
    afterNextRender(() => this.initMap());

    // 2. GeoJSON: se reconstruye cuando llega la lista de países. Cada vez se
    //    borra la capa previa para no dibujar los países dos veces.
    effect(() => {
      const countries = this.store.countries();
      if (!this.viewReady() || countries.length === 0) return;

      if (this.geoLayer) {
        this.map?.removeLayer(this.geoLayer);
        this.geoLayer = null;
        this.geoReady.set(false);
      }

      const byCode = this.store.byCode();
      this.geoRequest?.abort();
      const controller = new AbortController();
      this.geoRequest = controller;

      void this.loadGeoJson(byCode, countries, controller.signal);
    });

    // 3. Resaltado + vuelo de cámara. Depende de geoReady para cubrir el caso de
    //    que el país ya estuviera seleccionado antes de que se pintara el mapa.
    effect(() => {
      const selected = this.store.country();
      if (!this.geoReady() || !this.map) return;

      const byCode = this.store.byCode();
      const countries = this.store.countries();

      this.geoLayer?.eachLayer((layer) => {
        const path = layer as L.Path & { feature?: GeoFeature };
        const code = getCountryCode(path.feature?.properties, byCode, countries);
        path.setStyle(styleFor(code, selected, byCode));
      });

      if (selected) {
        const zoom = WIDE_CODES.includes(selected.code) ? 4 : 5;
        this.map.flyTo(L.latLng(selected.coords[0], selected.coords[1]), zoom, {
          duration: 1.2,
        });
      }
    });
  }

  private initMap(): void {
    const host = this.container().nativeElement;
    if (!host.parentElement) {
      console.warn('MapView container not mounted to DOM yet');
      return;
    }

    const map = L.map(host, {
      center: [-8, -75],
      zoom: 4,
      minZoom: 2,
      maxZoom: 9,
      zoomControl: false,
    });
    this.map = map;

    L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png?key=${environment.cartoApiKey}`,
      { attribution: '&copy; OpenStreetMap, &copy; CARTO', subdomains: 'abcd' },
    ).addTo(map);

    this.viewReady.set(true);
  }

  private async loadGeoJson(
    byCode: Record<string, Pais>,
    countries: Pais[],
    signal: AbortSignal,
  ): Promise<void> {
    try {
      const response = await fetch(GEOJSON_URL, { signal });
      if (!response.ok) throw new Error(`GeoJSON fetch failed: ${response.status}`);

      const geo = (await response.json()) as GeoFeatureCollection;

      // El componente pudo destruirse o la petición cancelarse durante la espera.
      if (!this.map || !this.map.getContainer().parentElement || signal.aborted) return;

      const layer = L.geoJSON(geo, {
        style: (feature) =>
          styleFor(getCountryCode(feature?.properties, byCode, countries), null, byCode),
        onEachFeature: (feature, lyr) => {
          const code = getCountryCode(feature.properties, byCode, countries);
          const c = code ? byCode[code] : null;
          if (!c) return;

          lyr.bindTooltip(c.name, { direction: 'top' });
          lyr.on({ click: () => this.store.selectCountry(c) });
        },
      });

      layer.addTo(this.map);
      this.geoLayer = layer;
      this.geoReady.set(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Error loading GeoJSON:', error);
    }
  }

  ngOnDestroy(): void {
    // Sin esta limpieza Leaflet deja listeners en el window y cachea las
    // dimensiones del contenedor, así que un segundo montaje fallaría.
    this.geoRequest?.abort();
    this.map?.remove();
    this.map = null;
    this.geoLayer = null;
  }
}
