/**
 * src/app/core/services/expressions.service.ts
 *
 * Lectura de expresiones culturales desde `GET /api/expresiones`.
 *
 * Antes esta sección no tenía service: las cuatro expresiones vivían en
 * `core/data/art-data.ts`, una constante, con el país como texto suelto y las
 * imágenes enlazadas a Bing y Pinterest. El comentario de aquel archivo lo
 * decía ("contenido editorial estático"), pero los datos tenían tres problemas
 * que solo se veían al mirarlos: el país no se podía cruzar con nada, las
 * categorías eran texto libre y las imágenes no se podían licenciar.
 *
 * NO HAY FALLBACK LOCAL, y es deliberado.
 *
 * `CountriesService` mantiene una lista de respaldo en `countries.ts` porque sin
 * ella el mapa entero se queda en blanco si el backend no arranca. Aquí no
 * existe `expressions.ts` de respaldo, y con una expresión inventada el fallo se
 * parecería a un dato bueno: se vería una tarjeta de una tradición que nadie ha
 * verificado. Es preferible que la sección esté vacía y se note.
 *
 * Por lo mismo `catchError` devuelve una lista vacía en lugar de los datos
 * hardcodeados, y la vista lo distingue con un mensaje.
 */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CATEGORIAS_EXPRESION } from '../models';
import type { CategoriaExpresion, ExpresionCultural, ExpresionCulturalDto } from '../models';

/**
 * Valida la categoría contra la lista cerrada en vez de hacer `as CategoriaExpresion`.
 *
 * Es el mismo motivo que en `countries.service.ts` con las regiones: el backend
 * manda un `string` y el compilador no puede saber que es una de las nueve. Si el
 * backend añadiera un valor y olvidara actualizar el frontend, un `as` lo
 * aceptaría en silencio y el filtro lo agruparía con una etiqueta `undefined`.
 */
function toCategoria(value: string): CategoriaExpresion | null {
  return value in CATEGORIAS_EXPRESION ? (value as CategoriaExpresion) : null;
}

/**
 * Mapea el DTO al modelo de la vista.
 *
 * Una expresión con categoría desconocida se descarta (`null`) en lugar de
 * entrar a medias. La alternativa —dejar pasar el valor y que el filtro muestre
 * una categoría vacía— produce una tarjeta que no se puede filtrar ni explicar.
 */
export function mapExpresionDTO(dto: ExpresionCulturalDto): ExpresionCultural | null {
  const categoria = toCategoria(dto.categoria);
  if (!categoria) {
    console.warn(`Expresión ${dto.id} con categoría desconocida: ${dto.categoria}`);
    return null;
  }

  return {
    id: dto.id,
    titulo: dto.titulo,
    categoria,
    categoriaLabel: CATEGORIAS_EXPRESION[categoria],
    paisCode: dto.paisCode,
    paisNombre: dto.paisNombre,
    desc: dto.descText,
    imagenUrl: dto.imagenUrl,
    creditos: dto.creditos,
  };
}

@Injectable({ providedIn: 'root' })
export class ExpressionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Observable de todas las expresiones. Emite una vez y se completa.
   *
   * `shareReplay({ bufferSize: 1, refCount: false })` evita llamadas duplicadas si
   * varios componentes se suscriben a la vez.
   */
  readonly expresiones$: Observable<ExpresionCultural[]> = this.http
    .get<ExpresionCulturalDto[]>(`${this.baseUrl}/expresiones`)
    .pipe(
      map((data) =>
        data
          .map(mapExpresionDTO)
          .filter((e): e is ExpresionCultural => e !== null),
      ),
      catchError((err: HttpErrorResponse) => {
        console.warn(`Backend unavailable (${err.status}) al cargar /expresiones`);
        return of([] as ExpresionCultural[]);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  /**
   * Las expresiones de un país.
   *
   * Cualquier fallo devuelve lista vacía, y el 404 NO es una excepción. 15 de los
   * 19 países no tienen ninguna todavía, así que "este país no tiene expresiones"
   * es el caso normal y no un error que haya que distinguir del fallo de red: en
   * ambos casos la vista tiene que pintar lo mismo. Un `switch` sobre el status
   * tendría dos ramas idénticas, que es ruido que sugiere una distinción que no
   * existe.
   */
  porPais(codigo: string): Observable<ExpresionCultural[]> {
    return this.http.get<ExpresionCulturalDto[]>(`${this.baseUrl}/expresiones/${codigo}`).pipe(
      map((data) =>
        data
          .map(mapExpresionDTO)
          .filter((e): e is ExpresionCultural => e !== null),
      ),
      catchError((err: HttpErrorResponse) => {
        if (err.status !== 404) {
          console.warn(`Error (${err.status}) al cargar /expresiones/${codigo}`);
        }
        return of([] as ExpresionCultural[]);
      }),
    );
  }
}
