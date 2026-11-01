/**
 * src/app/features/propuestas/moderar.ts
 *
 * Cola de moderación: aprobar o rechazar las propuestas pendientes. Solo
 * `COLABORADOR` o superior, y la ruta lo comprueba con `rolGuard`.
 *
 * Lo importante de esta pantalla es que el motivo del rechazo es obligatorio,
 * y no por capricho de la interfaz: el backend lo exige (`IllegalArgumentException`
 * → 400) y el CHECK de la base lo vuelve a exigir. Aquí se pide para que la
 * persona que rechaza entienda que tiene que explicarse, que es el punto de
 * todo el mecanismo.
 *
 * La razón por la que se pide en la propia fila y no en un `prompt()` es que el
 * `prompt()` devuelve `null` con el botón de cancelar, y "cancelar" y "rechazar
 * sin motivo" no son la misma cosa.
 */
import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { mensajeDeError } from '../../core/http/api-error';
import { PropuestasService } from '../../core/services/propuestas.service';
import type { Propuesta } from '../../core/models';

@Component({
  selector: 'app-moderar',
  imports: [FormsModule, DatePipe],
  templateUrl: './moderar.html',
})
export class Moderar {
  private readonly servicio = inject(PropuestasService);

  protected readonly pendientes = signal<Propuesta[]>([]);
  protected readonly cargando = signal(false);
  protected readonly procesando = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);

  /** Id de la propuesta abierta, con su motivo en curso. */
  protected readonly rechazando = signal<number | null>(null);
  protected readonly motivo = signal('');

  constructor() {
    void this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.pendientes.set(await this.servicio.pendientes());
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  protected abrirRechazo(id: number): void {
    this.rechazando.set(id);
    this.motivo.set('');
  }

  protected cerrarRechazo(): void {
    this.rechazando.set(null);
    this.motivo.set('');
  }

  protected async aprobar(p: Propuesta): Promise<void> {
    await this.decidir(p, { estado: 'APROBADA', motivo: null });
  }

  protected async rechazar(p: Propuesta): Promise<void> {
    const motivo = this.motivo().trim();
    if (motivo === '') {
      this.error.set('Escribe el motivo del rechazo: quien propuso el lugar tiene que saber por qué.');
      return;
    }
    await this.decidir(p, { estado: 'RECHAZADA', motivo });
  }

  /**
   * Aplica la decisión y quita la propuesta de la lista.
   *
   * Se quita en vez de recargar la cola entera porque el endpoint devuelve la
   * propuesta ya actualizada: recargarlo sería un viaje extra por cada decisión
   * y, con un aprobador trabajando en abierto, un parpadeo innecesario.
   */
  private async decidir(
    p: Propuesta,
    decision: { estado: 'APROBADA' | 'RECHAZADA'; motivo: string | null },
  ): Promise<void> {
    if (this.procesando() !== null) {
      return;
    }
    this.procesando.set(p.id);
    this.error.set(null);
    this.aviso.set(null);
    try {
      const actualizada = await this.servicio.revisar(p.id, decision);
      this.pendientes.update((lista) => lista.filter((x) => x.id !== actualizada.id));
      this.cerrarRechazo();
      this.aviso.set(
        decision.estado === 'APROBADA'
          ? `"${p.nombre}" aprobada. Ya está en el mapa.`
          : `"${p.nombre}" rechazada.`,
      );
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.procesando.set(null);
    }
  }
}
