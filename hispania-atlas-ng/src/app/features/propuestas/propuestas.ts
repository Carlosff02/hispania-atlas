/**
 * src/app/features/propuestas/propuestas.ts
 *
 * Vista de propuestas del usuario: enviar una nueva y ver el historial de las
 * suyas con su estado.
 *
 * Un componente con dos pestañas en vez de dos rutas, porque son dos mitades
 * del mismo encargo y el usuario alterna entre ellas constantemente. Lo que sí es
 * ruta aparte es la cola de moderación: esa la ven otras personas, tiene su
 * propia guard por rol y no tiene sentido que aparezca en la misma pantalla.
 *
 * La pestaña de enviar desaparece para ADMIN y ADMIN_SISTEMA, que no pueden
 * proponer: ya crean el lugar directamente. Se oculta y no se bloquea, porque el
 * backend es quien rechaza el envío; esto solo evita ofrecer un botón que iba a
 * devolver un 403.
 */
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { puedeProponer } from '../../core/auth/roles';
import { mensajeDeError } from '../../core/http/api-error';
import { AuthService } from '../../core/services/auth.service';
import { PropuestasService } from '../../core/services/propuestas.service';
import type { CategoriaLugar, Propuesta } from '../../core/models';

const CATEGORIAS: CategoriaLugar[] = [
  'ARTE',
  'DANZA',
  'ARQUEOLOGIA',
  'PATRIMONIO',
  'HISTORICO',
  'INFRAESTRUCTURA',
  'PAISAJE_NATURAL',
  'ACADEMICO',
  'GASTRONOMICO',
];

/** Texto legible de cada estado, para no pintar el enum crudo. */
const ESTADO_TEXTO: Record<Propuesta['estado'], string> = {
  PENDIENTE: 'En revisión',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
};

/** Clases de color por estado. Verde, ámbar y rojo, en la paleta del atlas. */
const ESTADO_CLASE: Record<Propuesta['estado'], string> = {
  PENDIENTE: 'bg-amber-500/15 text-amber-200 border-amber-400/50',
  APROBADA: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/50',
  RECHAZADA: 'bg-red-500/15 text-red-200 border-red-400/50',
};

type Pestana = 'enviar' | 'mias';

@Component({
  selector: 'app-propuestas',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './propuestas.html',
})
export class Propuestas {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(PropuestasService);
  private readonly auth = inject(AuthService);

  protected readonly categorias = CATEGORIAS;
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);

  /** Si el rol vigente puede entrar por la cola de propuestas o tiene que crear directo. */
  protected readonly puedeProponer = computed(() => puedeProponer(this.auth.rol()));

  /**
   * La pestaña elegida, con un recorte para quien no puede proponer.
   *
   * Se resuelve en un `computed` y no escribiendo sobre la señal al detectar el rol
   * porque el rol no se conoce al construir el componente: llega con la
   * revalidación del token, después. Con el recorte, un administrador que entre
   * con la pestaña de enviar por defecto aterriza en "Mis propuestas" solo, sin
   * necesitar un efecto que compense el caso.
   */
  protected readonly pestanaElegida = signal<Pestana>('enviar');
  protected readonly pestana = computed<Pestana>(() => {
    const elegida = this.pestanaElegida();
    return elegida === 'enviar' && !this.puedeProponer() ? 'mias' : elegida;
  });

  protected readonly mias = signal<Propuesta[]>([]);
  protected readonly cargandoMias = signal(false);

  /*
   * Latitud y longitud se guardan como texto, no como número.
   *
   * Un `<input type="number">` vacío devuelve `''`, y si el control se declara
   * como `number` habría que mentirle al compilador con un `as unknown as`.
   * Es preferible que el formulario devuelva exactamente lo que escribió la
   * persona y convertir con `Number()` al enviar, que además de ser honesto
   * hace inútil el `NaN`: se comprueba antes.
   */
  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    country: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    lat: ['', [Validators.required]],
    lng: ['', [Validators.required]],
    category: ['ARTE' as CategoriaLugar, [Validators.required]],
    period: ['', [Validators.maxLength(50)]],
    descText: ['', [Validators.maxLength(1000)]],
    img: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    this.cargarMias();
  }

  protected estadoTexto(estado: Propuesta['estado']): string {
    return ESTADO_TEXTO[estado];
  }

  protected estadoClase(estado: Propuesta['estado']): string {
    return ESTADO_CLASE[estado];
  }

  protected async enviar(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const crudo = this.form.getRawValue();
    const lat = Number(crudo.lat);
    const lng = Number(crudo.lng);

    /*
     * El rango se comprueba aquí y no solo con los atributos `min`/`max` del
     * input, porque esos atributos no impiden enviar el formulario: se pueden
     * saltear con el teclado o con un valor pegado. Las reglas replican los
     * `@DecimalMin`/`@DecimalMax` del backend, que las volverá a comprobar.
     */
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      this.error.set('La latitud debe ser un número entre -90 y 90.');
      return;
    }
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      this.error.set('La longitud debe ser un número entre -180 y 180.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.servicio.proponer({
        nombre: crudo.nombre.trim(),
        country: crudo.country.trim().toUpperCase(),
        lat,
        lng,
        category: crudo.category,
        icon: null,
        period: textoOpcional(crudo.period),
        descText: textoOpcional(crudo.descText),
        img: textoOpcional(crudo.img),
      });
      this.form.reset({ category: 'ARTE' });
      this.aviso.set('Propuesta enviada. Quedará pendiente hasta que un colaborador la revise.');
      this.pestanaElegida.set('mias');
      await this.cargarMias();
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.submitting.set(false);
    }
  }

  protected async cargarMias(): Promise<void> {
    this.cargandoMias.set(true);
    try {
      this.mias.set(await this.servicio.mias());
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.cargandoMias.set(false);
    }
  }

  protected controlMarcado(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.touched && control.invalid;
  }
}

/**
 * El backend distingue `null` de cadena vacía con `@NotBlank`, así que un campo
 * opcional que se deja en blanco tiene que viajar como `null` y no como `""`.
 * Es la diferencia entre "no lo he rellenado" y "lo he rellenado con nada".
 */
function textoOpcional(valor: string): string | null {
  const limpio = valor.trim();
  return limpio === '' ? null : limpio;
}
