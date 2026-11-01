/**
 * src/app/core/http/api-error.ts
 *
 * Traduce una respuesta de error del backend a un mensaje presentable.
 *
 * Vive aquí y no en un componente porque lo usan tres sitios (login, registro y
 * las vistas de propuestas y administración) y porque los errores de la API no
 * son cosa de ninguna pantalla concreta: son del contrato con el servidor.
 *
 * El backend tiene un único formato de error (`ApiError` en
 * `GlobalExceptionHandler`), con un `message` ya redactado y, cuando falla una
 * validación, `details` con el campo concreto. Se prioriza `message` y se cae a
 * los detalles, que es lo que evita que un 400 aparezca en pantalla como
 * "Http failure response for /api/auth/login: 400 Bad Request".
 */
import { HttpErrorResponse } from '@angular/common/http';

import type { ApiError } from '../models';

export function mensajeDeError(e: unknown): string {
  if (!(e instanceof HttpErrorResponse)) {
    return 'No se pudo completar la operación.';
  }

  const cuerpo = e.error as ApiError | null;

  if (cuerpo?.message) {
    return cuerpo.message;
  }
  if (cuerpo?.details?.length) {
    return cuerpo.details.map((d) => `${d.field}: ${d.message}`).join(' · ');
  }
  return e.status === 0
    ? 'No hay conexión con el servidor.'
    : `Error ${e.status} al procesar la solicitud.`;
}
