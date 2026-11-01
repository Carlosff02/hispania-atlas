/**
 * src/app/features/auth/registro.ts
 *
 * Pantalla de alta de cuenta. Equivalente de `features/auth/Register.tsx`.
 *
 * Los `Validators` replican las reglas del backend (`RegistroRequest`), pero no
 * las sustituyen: el servidor vuelve a validarlas y su respuesta es la que
 * llega al usuario. Duplicarlas aquí es para dar el error al instante y no
 * gastar un viaje, y el comentario de cada validador dice cuál es la regla de
 * Java a la que corresponde.
 */
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { mensajeDeError } from '../../core/http/api-error';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-Z0-9_]+$/),
      ],
    ],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    nombre: ['', [Validators.maxLength(100)]],
    repetirPassword: ['', [Validators.required]],
  });

  protected async enviar(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const { repetirPassword, ...datos } = this.form.getRawValue();
    if (datos.password !== repetirPassword) {
      this.error.set('Las dos contraseñas no coinciden.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.auth.registro({ ...datos, nombre: datos.nombre || null });
      await this.router.navigateByUrl('/explorar');
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.submitting.set(false);
    }
  }

  /** Marca un campo como tocado para que su error se muestre al enviar. */
  protected controlMarcado(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.touched && control.invalid;
  }
}
