/**
 * src/app/features/admin/usuarios.ts
 *
 * Administración de cuentas. Solo `ADMIN` o superior, con `rolGuard('ADMIN')` en
 * la ruta.
 *
 * El punto delicado de esta pantalla son las reglas de qué fila se puede tocar.
 * Están en `roles.ts` (`puedeModificar` y `puedeAsignar`), que es el espejo de
 * la clase `Jerarquia` de Java, y hay dos motivos para calcularlo aquí:
 *
 *  1. Para no pintar un botón que el servidor iba a rechazar con un 403. Un
 *     administrador que ve un desplegable de rol en la fila de su colega y lo
 *     descubre con un error ha aprendido algo que la interfaz debía saber.
 *  2. Porque sin esto la pantalla sería un formulario lleno de controles muertos.
 *
 * Lo que NO hace esta pantalla es decidir la seguridad. Si alguien manipula el
 * DOM y llama al endpoint directamente, la respuesta es la misma: 403. Los
 * controles de aquí son comodidad; los del backend son los que cuentan.
 */
import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ETIQUETA_ROL, ROLES, puedeAsignar, puedeModificar } from '../../core/auth/roles';
import { mensajeDeError } from '../../core/http/api-error';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import type { Rol, Usuario } from '../../core/models';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, DatePipe],
  templateUrl: './usuarios.html',
})
export class Usuarios {
  private readonly admin = inject(AdminService);
  private readonly auth = inject(AuthService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly cargando = signal(false);
  protected readonly procesando = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);

  /** Filtro por rol. `''` es "todos"; el enum no tiene valor vacío. */
  protected readonly filtro = signal<Rol | ''>('');

  protected readonly roles = ROLES;
  protected readonly etiquetaRol = ETIQUETA_ROL;

  constructor() {
    void this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const filtro = this.filtro();
      this.usuarios.set(await this.admin.listar(filtro === '' ? null : filtro));
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  protected esYo(u: Usuario): boolean {
    return u.id === this.auth.usuario()?.id;
  }

  /** ¿Se le pueden abrir los controles de esta fila? Espejo de `puedeModificar`. */
  protected editable(u: Usuario): boolean {
    return puedeModificar(this.auth.rol(), u.rol, this.auth.usuario()?.id ?? null, u.id);
  }

  /** ¿Aparece el desplegable con este rol como opción? */
  protected asignable(nuevo: Rol): boolean {
    return puedeAsignar(this.auth.rol(), nuevo);
  }

  protected async cambiarRol(u: Usuario, nuevo: Rol): Promise<void> {
    if (nuevo === u.rol) {
      return;
    }
    await this.aplicar(u, (id) => this.admin.cambiarRol(id, nuevo), 'Rol actualizado');
  }

  protected async alternarActivo(u: Usuario): Promise<void> {
    await this.aplicar(
      u,
      (id) => this.admin.cambiarEstado(id, !u.activo),
      u.activo ? 'Cuenta desactivada' : 'Cuenta activada',
    );
  }

  /**
   * Aplica un cambio y sustituye la fila por la versión que devuelve el servidor.
   *
   * Se reescribe la fila, y no el estado local, porque la respuesta trae el rol
   * o el estado ya resueltos. Confiar en el valor local tras un cambio de rol
   * dejaría la pantalla mintiendo si el servidor hubiera corregido lo que le
   * mandamos.
   */
  private async aplicar(
    u: Usuario,
    accion: (id: number) => Promise<Usuario>,
    mensajeOk: string,
  ): Promise<void> {
    if (this.procesando() !== null) {
      return;
    }
    this.procesando.set(u.id);
    this.error.set(null);
    this.aviso.set(null);
    try {
      const actualizada = await accion(u.id);
      this.usuarios.update((lista) =>
        lista.map((x) => (x.id === actualizada.id ? actualizada : x)),
      );
      this.aviso.set(`${mensajeOk}: ${actualizada.username}.`);
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.procesando.set(null);
    }
  }
}
