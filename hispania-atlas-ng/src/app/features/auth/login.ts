/**
 * src/app/features/auth/login.ts
 *
 * Pantalla de inicio de sesión. Equivalente de `features/auth/Login.tsx`.
 *
 * Usa formularios reactivos (`ReactiveFormsModule`) en lugar de los
 * `[(ngModel)]` de los dos lados. Es mejor por dos razones concretas: los
 * `Validators` se evaluan al escribir sin tocar el botón, y el valor del
 * formulario vive en un `FormGroup` que se puede leer entero al enviar, en vez
 * de repartido en veinte propiedades del componente.
 *
 * El mapeo de los errores del backend a mensajes entendibles está en
 * `mensajeDeError`, y es la pieza que hace que un 400 del servidor no se vea
 * como un `Http failure response for ...` en la pantalla.
 */
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { mensajeDeError } from '../../core/http/api-error';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  constructor() {
    // Si ya hay sesión, entrar otra vez no tiene sentido: se va directo a la app.
    if (this.auth.autenticado()) {
      void this.router.navigateByUrl(this.destino());
    }
  }

  protected async enviar(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.auth.login(this.form.getRawValue());
      await this.router.navigateByUrl(this.destino());
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.submitting.set(false);
    }
  }

  /** Destino tras entrar: el que el usuario intentaba, o la portada. */
  private destino(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl') ?? '/explorar';
  }
}
