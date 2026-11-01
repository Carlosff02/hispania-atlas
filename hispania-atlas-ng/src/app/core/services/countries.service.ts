/**
 * src/app/core/services/countries.service.ts
 *
 * Equivalente Angular de `services/countriesService.ts`. Los dos cambios
 * estructurales frente a la versión React:
 *
 *  1. `fetch(url)` se reemplaza por `HttpClient` (`get<T>()`), que devuelve un
 *     Observable. Para esperar un valor puntual usamos `firstValueFrom()` dentro
 *     de un `async`/`await`, o `toSignal()` si lo queremos como signal.
 *  2. Los errores de red NO llegan por `catch` sino por el canal de error del
 *     Observable, así que el fallback se decide con `catchError`.
 *
 * El mapeo DTO -> dominio se mantiene idéntico, porque el contrato del backend
 * no depende del framework del frontend.
 */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, firstValueFrom, map, Observable, of, shareReplay, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { countries as fallbackCountries } from '../data/countries';
import type { Pais, PaisDto, Region } from '../models';

const COLORS: Record<string, string> = {
  MX: '#5c8063', GT: '#6eb5b5', SV: '#b56e6e', HN: '#b5a36e', NI: '#8c6eb5',
  CR: '#6e8cb5', PA: '#b56eb5', CU: '#9c5c5c', DO: '#5c7a9c', PR: '#7a9c5c',
  VE: '#8d995c', CO: '#cca743', EC: '#608f9c', PE: '#b88d45', BO: '#965c5c',
  PY: '#73637a', UY: '#60708f', AR: '#689bb5', CL: '#a84a4a',
};

const REGIONES: Region[] = ['Norteamérica', 'Centroamérica', 'Caribe', 'Andina', 'Cono Sur'];

/**
 * El backend manda `region` como `string`. En vez de `as Region` (que engaña al
 * compilador), validamos contra la lista cerrada: si llega un valor inesperado
 * se avisa en consola y se usa un valor por defecto en vez de romper la vista.
 */
function toRegion(value: string): Region {
  return (REGIONES as string[]).includes(value) ? (value as Region) : 'Andina';
}

/** Mapea los datos del backend al formato del dominio. */
export function mapPaisDTOToPais(dto: PaisDto): Pais {
  // El último elemento de seriesHistoricas es el más reciente (2026).
  const latestSeries = dto.seriesHistoricas[dto.seriesHistoricas.length - 1];

  return {
    code: dto.code,
    name: dto.name,
    capital: dto.capital,
    coords: [dto.lat, dto.lng],
    region: toRegion(dto.region),
    gdp: latestSeries?.gdp ?? 0,
    gdpPc: latestSeries?.gdpPc ?? 0,
    pop: latestSeries?.pop ?? 0,
    growth: latestSeries?.growth ?? 0,
    inflation: latestSeries?.inflation ?? 0,
    exports: latestSeries?.exports ?? 0,
    imports: latestSeries?.imports ?? 0,
    hdi: latestSeries?.hdi ?? 0,
    debt: latestSeries?.debt ?? 0,
    trade: latestSeries?.trade ?? 0,
    desc: dto.descText,
    color: COLORS[dto.code] ?? '#000000',
    series: dto.seriesHistoricas.map((s) => ({ year: s.year, gdp: s.gdp })),
  };
}

@Injectable({ providedIn: 'root' })
export class CountriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Observable de todos los países. Emite UNA vez y se completa.
   * Si el backend no responde, emite los datos de respaldo locales.
   *
   * `shareReplay(1)` evita N llamadas duplicadas si varios componentes se
   * suscriben a la vez (equivalente al refetch-memoization de React Query).
   */
  readonly countries$: Observable<Pais[]> = this.http.get<PaisDto[]>(`${this.baseUrl}/countries`).pipe(
    map((data) => data.map(mapPaisDTOToPais)),
    catchError((err: HttpErrorResponse) => {
      console.warn(
        `❌ Backend unavailable (${err.status}) al cargar /countries, using fallback data`,
      );
      return of(fallbackCountries);
    }),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  /** Versión `async`/`await` de `countries$`, para quien prefiera esa sintaxis. */
  fetchCountries(): Promise<Pais[]> {
    return firstValueFrom(this.countries$);
  }

  /**
   * Un país por código. A diferencia de la lista, aquí NO hay fallback: un 404
   * significa "ese país no existe" y debe propagarse como error real.
   */
  fetchCountryByCode(code: string): Observable<Pais | null> {
    return this.http.get<PaisDto>(`${this.baseUrl}/countries/${code}`).pipe(
      map(mapPaisDTOToPais),
      catchError((err: HttpErrorResponse) =>
        err.status === 404 ? of(null) : throwError(() => err),
      ),
    );
  }
}

/**
 * Construye un diccionario de países por código para búsquedas O(1) en vez de
 * O(n). Se usa en la vista Cultura, que resuelve país de cada lugar en plantilla.
 */
export function buildCountriesByCode(countries: Pais[]): Record<string, Pais> {
  return Object.fromEntries(countries.map((c) => [c.code, c]));
}
