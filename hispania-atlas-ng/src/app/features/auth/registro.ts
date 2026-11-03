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
import { NgClass } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { mensajeDeError } from '../../core/http/api-error';
import { AuthService } from '../../core/services/auth.service';

/**
 * Comprueba que las dos contraseñas coinciden.
 *
 * Se valida en el grupo y no al enviar para que el aviso aparezca mientras se
 * escribe la segunda. `repetirPassword` es el campo que se marca, porque es el
 * que la persona acaba de teclear y el que tiene que corregir.
 */
function coinciden(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value ?? '';
  const repetir = control.get('repetirPassword')?.value ?? '';
  if (repetir === '') return null;
  return password === repetir ? null : { noCoincide: true };
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly verPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
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
    },
    { validators: coinciden },
  );

  protected async enviar(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, email, password, nombre } = this.form.getRawValue();

    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.auth.registro({ username, email, password, nombre: nombre || null });
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

  /**
   * Mensaje concreto por campo. Un "revisa el campo" obliga a adivinar cuál de
   * las cuatro reglas del usuario se ha incumplido.
   */
  protected errorDe(campo: string): string {
    const control = this.form.get(campo);
    if (!control || !control.touched || control.valid) return '';
    const errores = control.errors ?? {};

    if (errores['required']) return 'Este campo es obligatorio.';
    if (errores['noCoincide']) return 'Las dos contraseñas no coinciden.';
    if (errores['email']) return 'El email no tiene un formato válido.';
    if (errores['minlength']) {
      return `Necesita al menos ${errores['minlength'].requiredLength} caracteres.`;
    }
    if (errores['maxlength']) {
      return `Máximo ${errores['maxlength'].requiredLength} caracteres.`;
    }
    if (errores['pattern']) {
      return 'Solo letras sin tildes, números y guion bajo (sin espacios).';
    }
    return 'Revisa este campo.';
  }
}
