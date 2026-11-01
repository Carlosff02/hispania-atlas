/**
 * src/app/features/lugares/lugares.ts
 *
 * Gestión directa de lugares: crear, actualizar y eliminar sin pasar por la cola
 * de propuestas. Es la vía que sustituye a proponer + moderar cuando quien
 * escribe ya tiene rango de colaborador.
 *
 * Las dos vías coexisten a propósito. Un `USUARIO` sigue proposing porque no
 * tiene otra; a partir de `COLABORADOR` el rodeo por la cola deja de aportar
 * nada, y por eso esta pantalla aparece en el menú a partir de ese rol y la de
 * proponer se le oculta (ver `puedeProponer`). Quien prefiera el visto bueno de
 * otra persona puede seguir usando "Mis propuestas".
 *
 * La lista se lee del `AppStore` y no de una copia local. El store es quien
 * alimenta el mapa, así que guardar aquí y refrescar con `recargarLugares()`
 * deja las dos vistas de acuerdo sin tener que sincronizar dos arrays: si la
 * gestión tuviera su propia lista, un alta se vería en esta pantalla y no en el
 * mapa, que es justo el sitio donde se nota que algo falló.
 *
 * El botón de borrar solo se pinta para `ADMIN`+ (espejo de
 * `@jerarquia.puede(authentication, 'ADMIN')` en `LugarController`). Igual que
 * en `admin/usuarios`, esconderlo es comodidad y no seguridad: el backend
 * responde 403 igual, y esa es la comprobación que cuenta.
 */
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { CountriesService } from '../../core/services/countries.service';
import { PlacesService } from '../../core/services/places.service';
import { AppStore } from '../../core/state/app.store';
import { mensajeDeError } from '../../core/http/api-error';
import { idValido, sugerirId } from './slug';
import type { CategoriaLugar, Lugar, LugarRequest, Pais } from '../../core/models';

const CATEGORIAS: CategoriaLugar[] = [
  'ARTE', 'DANZA', 'ARQUEOLOGIA', 'PATRIMONIO', 'HISTORICO',
  'INFRAESTRUCTURA', 'PAISAJE_NATURAL', 'ACADEMICO', 'GASTRONOMICO',
];

/**
 * Iconos que se ofrecen. Son los que ya usan los lugares cargados, y se
 * ofrecen en desplegable en vez de en texto libre porque la columna es la
 * Illustrated Flag Emoji; un valor inventado se dibujaría como un hueco vacío
 * en la ficha del lugar.
 */
const ICONOS: string[] = ['landmark', 'building', 'palette', 'music', 'tree'];

@Component({
  selector: 'app-lugares',
  imports: [ReactiveFormsModule],
  templateUrl: './lugares.html',
})
export class Lugares {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly places = inject(PlacesService);
  private readonly store = inject(AppStore);
  private readonly countriesService = inject(CountriesService);

  protected readonly categorias = CATEGORIAS;
  protected readonly iconos = ICONOS;
  protected readonly paises = signal<Pais[]>([]);

  /** La lista del store, de lectura: aquí no se muta, se refresca con el store. */
  protected readonly lugares = this.store.places;

  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly guardando = signal(false);
  /** Id del lugar cuyo borrado está en curso, para deshabilitar solo su botón. */
  protected readonly borrando = signal<string | null>(null);

  /** Id del lugar abierto en el formulario; `null` significa "alta nueva". */
  protected readonly editando = signal<string | null>(null);

  /**
   * Id del lugar que espera una segunda confirmación.
   *
   * El borrado no tiene vuelta atrás: no hay baja lógica, y `lugares.id` es la
   * clave primaria que referencian las propuestas aprobadas. Por eso no se
   * borra con el primer clic, sino con un botón "Confirmar" que sustituye al
   * original. Es más código que un `window.confirm`, y a cambio el botón
   * destructivo no aparece por sorpresa y el estado se puede comprobar en la
   * plantilla en vez de depender de un diálogo del navegador.
   */
  protected readonly confirmando = signal<string | null>(null);

  protected readonly filtro = signal('');

  protected readonly puedeBorrar = computed(() => this.auth.puede('ADMIN'));

  protected readonly filtrados = computed<Lugar[]>(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (texto === '') {
      return this.lugares();
    }
    return this.lugares().filter(
      (l) =>
        l.name.toLowerCase().includes(texto) ||
        l.id.toLowerCase().includes(texto) ||
        l.country.toLowerCase().includes(texto),
    );
  });

  /**
   * Latitud y longitud se guardan como texto, igual que en `propuestas`.
   *
   * Un `<input type="number">` vacío devuelve `''`, y declararlos como `number`
   * obligaría a mentirle al compilador con un `as unknown as`. Convertir con
   * `Number()` al enviar mantiene el formulario honesto y hace inútil el `NaN`,
   * que además se comprueba contra los rangos del backend.
   */
  protected readonly form = this.fb.nonNullable.group({
    id: [''],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    country: ['', [Validators.required]],
    lat: ['', [Validators.required]],
    lng: ['', [Validators.required]],
    category: ['PATRIMONIO' as CategoriaLugar, [Validators.required]],
    icon: ['landmark'],
    period: ['', [Validators.maxLength(50)]],
    descText: ['', [Validators.maxLength(1000)]],
    img: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    /*
     * Los países vienen del servicio con su propio respaldo local, así que esta
     * llamada no falla: aunque el backend no esté, el desplegable tendrá las
     * diecinueve entradas y se podrá seguir rellenando el formulario.
     */
    void this.countriesService.fetchCountries().then((paises) => this.paises.set(paises));
  }

  /* ------------------------------ Alta y edición ------------------------- */

  protected empezarAlta(): void {
    this.editando.set(null);
    this.form.reset({ category: 'PATRIMONIO', icon: 'landmark' });
    this.error.set(null);
    this.aviso.set(null);
  }

  protected editar(lugar: Lugar): void {
    this.editando.set(lugar.id);
    this.form.reset({
      id: lugar.id,
      name: lugar.name,
      country: lugar.country,
      lat: String(lugar.coords[0]),
      lng: String(lugar.coords[1]),
      category: lugar.category,
      icon: lugar.icon,
      period: lugar.period,
      descText: lugar.desc,
      img: lugar.img ?? '',
    });
    this.error.set(null);
    this.aviso.set(null);
  }

  protected cancelarEdicion(): void {
    this.editando.set(null);
    this.form.reset({ category: 'PATRIMONIO', icon: 'landmark' });
  }

  /** Rellena el id con el nombre escrito, si el nombre sirve para generarlo. */
  protected sugerirDesdeNombre(): void {
    const nombre = this.form.getRawValue().name.trim();
    if (nombre === '') {
      this.error.set('Escribe primero el nombre del lugar.');
      return;
    }
    const sugerido = sugerirId(nombre);
    if (sugerido === '') {
      this.error.set(
        'Ese nombre no tiene letras ni números, así que no sirve para generar un identificador. Escríbelo a mano.',
      );
      return;
    }
    this.form.patchValue({ id: sugerido });
  }

  protected async guardar(): Promise<void> {
    if (this.guardando()) {
      return;
    }
    this.error.set(null);
    this.aviso.set(null);

    const editando = this.editando();
    const crudo = this.form.getRawValue();
    const id = crudo.id.trim();

    /*
     * Se marcan los controles como tocados antes de validar a mano, para que los
     * avisos por campo aparezcan también cuando el error se detecta aquí y no en
     * un `Validator`. Los `required` y `maxLength` ya pintan su mensaje; los
     * rangos de coordenadas y el patrón del id no se pueden expresar con un
     * `Validator` sin tener que leer el valor de un input de texto.
     */
    this.form.markAllAsTouched();

    /*
     * El id solo se exige al alta. En una modificación lo impone la ruta, y
     * mandarlo caducado no rompería nada porque el backend lo ignora, pero
     * aceptarlo en silencio haría que el campo pareciera editable cuando no lo
     * es.
     */
    if (editando === null && !idValido(id)) {
      this.error.set(
        'El identificador es obligatorio en el alta y solo admite minúsculas, dígitos y guion bajo (50 caracteres como máximo).',
      );
      return;
    }
    if (crudo.name.trim() === '') {
      this.error.set('El nombre es obligatorio.');
      return;
    }
    if (crudo.country.trim().length !== 2) {
      this.error.set('Elige un país de la lista.');
      return;
    }

    const lat = Number(crudo.lat);
    const lng = Number(crudo.lng);
    /*
     * El rango se comprueba aquí y no solo con los atributos `min`/`max` del
     * input: esos atributos no impiden enviar el formulario, se pueden saltear
     * pegando un valor. Replica los `@DecimalMin`/`@DecimalMax` de `LugarRequest`.
     */
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      this.error.set('La latitud debe ser un número entre -90 y 90.');
      return;
    }
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      this.error.set('La longitud debe ser un número entre -180 y 180.');
      return;
    }

    const request: LugarRequest = {
      // `null` en la edición: el id lo pone la URL y el backend descarta el del
      // cuerpo. Mandarlo limpio evita que la pantalla y la ruta discrepen.
      id: editando === null ? id : null,
      name: crudo.name.trim(),
      country: crudo.country.trim().toUpperCase(),
      lat,
      lng,
      category: crudo.category,
      icon: textoOpcional(crudo.icon),
      period: textoOpcional(crudo.period),
      descText: textoOpcional(crudo.descText),
      img: textoOpcional(crudo.img),
    };

    this.guardando.set(true);
    try {
      if (editando === null) {
        await this.places.crear(request);
        this.aviso.set(`Lugar creado: ${request.name}. Ya aparece en el mapa.`);
      } else {
        await this.places.actualizar(editando, request);
        this.aviso.set(`Lugar actualizado: ${request.name}.`);
      }
      this.cancelarEdicion();
      await this.store.recargarLugares();
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.guardando.set(false);
    }
  }

  /* -------------------------------- Borrado ------------------------------ */

  protected pedirBorrado(id: string): void {
    this.confirmando.set(id);
    this.error.set(null);
    this.aviso.set(null);
  }

  protected cancelarBorrado(): void {
    this.confirmando.set(null);
  }

  protected async confirmarBorrado(id: string): Promise<void> {
    if (this.borrando() !== null) {
      return;
    }
    this.borrando.set(id);
    this.error.set(null);
    try {
      await this.places.eliminar(id);
      this.confirmando.set(null);
      this.aviso.set('Lugar eliminado.');
      // Si el lugar abierto en el formulario era este, la vista se queda con un
      // formulario de edición de algo que ya no existe.
      if (this.editando() === id) {
        this.cancelarEdicion();
      }
      await this.store.recargarLugares();
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.borrando.set(null);
    }
  }

  /* --------------------------------- Formulario --------------------------- */

  /**
   * Encabezado y texto del botón, que dependen de si el formulario es un alta o
   * una edición.
   *
   * Son métodos y no `computed` a propósito: el nombre de un lugar se puede
   * cambiar mientras se edita, y un `computed` que solo dependa de la señal
   * `editando` se quedaría con el valor que había cuando se abrió el formulario.
   * Leer el valor del control en cada detección de cambios es lo barato que
   * hace aquí.
   */
  protected tituloFormulario(): string {
    const id = this.editando();
    if (id === null) {
      return 'Nuevo lugar';
    }
    const nombre = this.form.getRawValue().name.trim();
    return nombre === '' ? `Editando ${id}` : `Editando: ${nombre}`;
  }

  protected textoBoton(): string {
    if (this.guardando()) {
      return 'Guardando…';
    }
    return this.editando() === null ? 'Crear lugar' : 'Guardar cambios';
  }

  protected controlMarcado(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.touched && control.invalid;
  }
}

/**
 * El backend distingue `null` de cadena vacía con `@NotBlank`, así que un campo
 * opcional en blanco tiene que viajar como `null` y no como `""`. Es la misma
 * razón, y el mismo helper, que en `propuestas.ts`.
 */
function textoOpcional(valor: string): string | null {
  const limpio = valor.trim();
  return limpio === '' ? null : limpio;
}
