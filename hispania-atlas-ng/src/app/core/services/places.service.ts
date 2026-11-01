/**
 * src/app/core/services/places.service.ts
 *
 * Equivalente Angular de `services/placesService.ts`.
 *
 * Diferencia clave con countries.service: aquí el fallback SÍ se aplica
 * también a la consulta de un lugar individual. La versión React lo
 * implementaba con `try/catch` alrededor de un `await`, reintentando contra el
 * array local; en RxJS el mismo comportamiento es un `catchError` que devuelve
 * `of(local)`.
 *
 * El respaldo es solo para LEER. Las tres operaciones de escritura del final del
 * archivo (`crear`, `actualizar`, `eliminar`) no lo tienen a propósito, y el
 * comentario de esa sección explica por qué.
 */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, firstValueFrom, map, Observable, of, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import { places as fallbackPlaces } from '../data/places';
import type { CategoriaLugar, Lugar, LugarDto, LugarRequest } from '../models';

const CATEGORIAS: CategoriaLugar[] = [
  'ARTE', 'DANZA', 'ARQUEOLOGIA', 'PATRIMONIO', 'HISTORICO',
  'INFRAESTRUCTURA', 'PAISAJE_NATURAL', 'ACADEMICO', 'GASTRONOMICO',
];

/** Igual que en countries: validamos en vez de castear a ciegas. */
function toCategoria(value: string): CategoriaLugar {
  return (CATEGORIAS as string[]).includes(value) ? (value as CategoriaLugar) : 'PATRIMONIO';
}

/** Mapea los datos del backend al formato del dominio. */
export function mapLugarDTOToLugar(dto: LugarDto): Lugar {
  return {
    id: dto.id,
    name: dto.name,
    country: dto.country,
    coords: [dto.lat, dto.lng],
    category: toCategoria(dto.category),
    icon: dto.icon,
    period: dto.period,
    desc: dto.descText,
    img: dto.img,
  };
}

@Injectable({ providedIn: 'root' })
export class PlacesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Todos los lugares, con fallback local si el backend no responde. */
  readonly places$: Observable<Lugar[]> = this.http.get<LugarDto[]>(`${this.baseUrl}/places`).pipe(
    map((data) => data.map(mapLugarDTOToLugar)),
    catchError((err: HttpErrorResponse) => {
      console.warn(
        `❌ Backend unavailable (${err.status}) al cargar /places, using fallback data`,
      );
      return of(fallbackPlaces);
    }),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  fetchPlaces(): Promise<Lugar[]> {
    return firstValueFrom(this.places$);
  }

  /** Un lugar por id; si no está en el backend, se busca en el respaldo local. */
  fetchPlaceById(id: string): Observable<Lugar | null> {
    return this.http.get<LugarDto>(`${this.baseUrl}/places/${id}`).pipe(
      map(mapLugarDTOToLugar),
      catchError((err: HttpErrorResponse) => {
        const local = fallbackPlaces.find((p) => p.id === id) ?? null;
        if (err.status === 404) {
          return of(local);
        }
        console.warn(
          `Failed to fetch place ${id} (${err.status}), checking fallback...`,
        );
        return of(local);
      }),
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                             Altas y ediciones                              */
  /* ------------------------------------------------------------------------ */
  /*
   * A partir de aquí NO hay fallback, y la ausencia es deliberada.
   *
   * El respaldo local de arriba existe para que el mapa se pueda abrir sin
   * backend. En una escritura sería justo lo contrario de lo que queremos: si el
   * POST falla y devolvemos los datos de respaldo, la pantalla anunciaría un alta
   * que no ocurrió, y un borrado fallido haría reaparecer el lugar por arte de
   * magia. Un error visible es preferible a un estado que miente, así que aquí
   * el error sube hasta el componente y lo pinta con `mensajeDeError`.
   *
   * Los permisos no se comprueban aquí. Es el backend quien decide, con los
   * `@PreAuthorize` de `LugarController`; este servicio solo traduce HTTP.
   */

  /** `POST /api/places`. El `id` del cuerpo es obligatorio aquí. */
  async crear(request: LugarRequest): Promise<Lugar> {
    const dto = await firstValueFrom(this.http.post<LugarDto>(`${this.baseUrl}/places`, request));
    return mapLugarDTOToLugar(dto);
  }

  /**
   * `PUT /api/places/{id}`. El id de la ruta manda sobre el del cuerpo, y por eso
   * `request.id` se ignora al construir la URL: si la pantalla se equivocara al
   * rellenar el formulario, el cambio caería en el lugar de la URL y no en otro.
   */
  async actualizar(id: string, request: LugarRequest): Promise<Lugar> {
    const dto = await firstValueFrom(
      this.http.put<LugarDto>(`${this.baseUrl}/places/${encodeURIComponent(id)}`, request),
    );
    return mapLugarDTOToLugar(dto);
  }

  /**
   * `DELETE /api/places/{id}`. Responde 204 sin cuerpo, así que no hay nada que
   * mapear; el `void` es lo que evita inventarse un `Lugar` de mentira.
   */
  async eliminar(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/places/${encodeURIComponent(id)}`));
  }

  /**
   * Vuelve a pedir la lista sin resortirse al respaldo local.
   *
   * La usa el store después de una escritura. `places$` está cacheado con
   * `shareReplay` para no repetir la petición en cada visitante, y sin esto un
   * alta aparecería solo al recargar la página: el mapa seguiría enseñando la
   * lista antigua.
   */
  async recargar(): Promise<Lugar[]> {
    const data = await firstValueFrom(this.http.get<LugarDto[]>(`${this.baseUrl}/places`));
    return data.map(mapLugarDTOToLugar);
  }
}
