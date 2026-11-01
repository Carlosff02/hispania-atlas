/**
 * src/app/core/services/propuestas.service.ts
 *
 * Cliente de `/api/propuestas`: enviar una propuesta, ver las propias y
 * moderar la cola de pendientes.
 *
 * A diferencia de `CountriesService`, aquí NO hay datos de respaldo. Una
 * propuesta que se envía y no aparece se perdería en silencio, que es
 * exactamente el fallo que no puede tener un sistema de colaboración: el
 * usuario cree que propuso algo y nadie lo sabe. Los errores se propagan.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Propuesta, PropuestaRequest, RevisionRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class PropuestasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Propone un lugar nuevo.
   *
   * No exige ningún rol en concreto: cualquiera con sesión puede proponer, que
   * es lo que hace que la moderación tenga sentido.
   */
  async proponer(datos: PropuestaRequest): Promise<Propuesta> {
    return firstValueFrom(this.http.post<Propuesta>(`${this.baseUrl}/propuestas`, datos));
  }

  /** Propuestas del usuario autenticado. */
  async mias(): Promise<Propuesta[]> {
    return firstValueFrom(this.http.get<Propuesta[]>(`${this.baseUrl}/propuestas/mias`));
  }

  /**
   * Cola de moderación. Solo `COLABORADOR` o superior.
   *
   * Que el endpoint devuelva solo las pendientes es lo que evita que haya que
   * filtrar en la interfaz para decidir qué se puede tocar.
   */
  async pendientes(): Promise<Propuesta[]> {
    return firstValueFrom(
      this.http.get<Propuesta[]>(`${this.baseUrl}/propuestas/pendientes`),
    );
  }

  /**
   * Aprueba o rechaza una propuesta. Solo `COLABORADOR` o superior.
   *
   * El servicio devuelve la propuesta ya actualizada, así que la vista
   * reemplaza la de la lista en vez de tener que recargarla entera.
   */
  async revisar(id: number, decision: RevisionRequest): Promise<Propuesta> {
    return firstValueFrom(
      this.http.put<Propuesta>(`${this.baseUrl}/propuestas/${id}/revision`, decision),
    );
  }
}
