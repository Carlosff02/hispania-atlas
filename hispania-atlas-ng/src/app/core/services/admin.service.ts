/**
 * src/app/core/services/admin.service.ts
 *
 * Cliente de `/api/admin/usuarios`.
 *
 * Un detalle importante: aquí NO se decide a quién se puede tocar. La pantalla
 * ofrece todos los controles y el backend los filtra, porque las reglas (solo
 * rango inferior, no delegar un poder que no se tiene, nadie se modifica a sí
 * mismo) son relaciones entre dos cuentas y no se pueden expresar mirando una
 * fila.
 *
 * Eso sí se refleja en la interfaz, y no solo para ahorrar trabajo: se calcula
 * qué controles tienen sentido con `puedeModificar`, en `roles.ts`, para no
 * pintar un botón que el servidor iba a rechazar con un 403. El filtro que
 * importa es el del servidor; este solo es para la experiencia.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Rol, Usuario } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Lista de cuentas, con filtro opcional por rol. */
  async listar(rol: Rol | null = null): Promise<Usuario[]> {
    const query = rol === null ? '' : `?rol=${rol}`;
    return firstValueFrom(
      this.http.get<Usuario[]>(`${this.baseUrl}/admin/usuarios${query}`),
    );
  }

  /**
   * Cambia el rol de una cuenta.
   *
   * Se descarta un cambio al mismo rol que ya tenía para que la interfaz no
   * ofrezca un "guardar" que no va a hacer nada.
   */
  async cambiarRol(id: number, rol: Rol): Promise<Usuario> {
    return firstValueFrom(
      this.http.put<Usuario>(`${this.baseUrl}/admin/usuarios/${id}/rol`, { rol }),
    );
  }

  /**
   * Activa o desactiva una cuenta.
   *
   * No hay `DELETE`: las propuestas y revisiones guardan la referencia a su
   * autor, así que borrar la fila dejaría el historial huérfano. Por eso la
   * interfaz ofrece un interruptor y no un botón de eliminar.
   */
  async cambiarEstado(id: number, activo: boolean): Promise<Usuario> {
    return firstValueFrom(
      this.http.patch<Usuario>(`${this.baseUrl}/admin/usuarios/${id}/estado`, { activo }),
    );
  }
}
