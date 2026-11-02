/**
 * src/app/features/lugares/lugares.ts
 *
 * Gestión directa de patrimonio: sitios físicos (lugares) y expresiones culturales.
 * Permite crear, actualizar y eliminar cualquiera de las dos entidades de patrimonio
 * directamente a usuarios con rol COLABORADOR o superior.
 */
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/services/auth.service';
import { CountriesService } from '../../core/services/countries.service';
import { PlacesService } from '../../core/services/places.service';
import { ExpressionsService } from '../../core/services/expressions.service';
import { AppStore } from '../../core/state/app.store';
import { mensajeDeError } from '../../core/http/api-error';
import { idValido, sugerirId } from './slug';
import type {
  CategoriaExpresion,
  CategoriaLugar,
  ExpresionCultural,
  Lugar,
  LugarRequest,
  Pais,
} from '../../core/models';
import { CATEGORIAS_EXPRESION_ORDEN } from '../../core/models';

const CATEGORIAS_LUGAR: CategoriaLugar[] = [
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

const ICONOS: string[] = ['landmark', 'building', 'palette', 'music', 'tree'];

export type TipoGestion = 'lugares' | 'expresiones';

@Component({
  selector: 'app-lugares',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './lugares.html',
})
export class Lugares {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly places = inject(PlacesService);
  private readonly expressionsService = inject(ExpressionsService);
  private readonly store = inject(AppStore);
  private readonly countriesService = inject(CountriesService);

  protected readonly tipoGestion = signal<TipoGestion>('lugares');

  protected readonly categoriasLugar = CATEGORIAS_LUGAR;
  protected readonly categoriasExpresion = CATEGORIAS_EXPRESION_ORDEN;
  protected readonly iconos = ICONOS;
  protected readonly paises = signal<Pais[]>([]);

  /* Lista de lugares */
  protected readonly lugares = this.store.places;

  /* Lista de expresiones culturales */
  protected readonly expresiones = toSignal(this.expressionsService.expresiones$, {
    initialValue: [] as ExpresionCultural[],
  });

  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly guardando = signal(false);
  protected readonly borrando = signal<string | null>(null);

  protected readonly editando = signal<string | null>(null);
  protected readonly confirmando = signal<string | null>(null);

  protected readonly filtro = signal('');
  protected readonly puedeBorrar = computed(() => this.auth.puede('ADMIN'));

  /* Filtrados lugares */
  protected readonly filtradosLugares = computed<Lugar[]>(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (texto === '') return this.lugares();
    return this.lugares().filter(
      (l) =>
        l.name.toLowerCase().includes(texto) ||
        l.id.toLowerCase().includes(texto) ||
        l.country.toLowerCase().includes(texto),
    );
  });

  /* Filtrados expresiones */
  protected readonly filtradasExpresiones = computed<ExpresionCultural[]>(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (texto === '') return this.expresiones();
    return this.expresiones().filter(
      (e) =>
        e.titulo.toLowerCase().includes(texto) ||
        e.id.toLowerCase().includes(texto) ||
        e.paisNombre.toLowerCase().includes(texto) ||
        e.paisCode.toLowerCase().includes(texto) ||
        e.categoria.toLowerCase().includes(texto),
    );
  });

  /* Formulario Lugares */
  protected readonly form = this.fb.nonNullable.group({
    id: [''],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    country: ['', [Validators.required]],
    lat: ['', [Validators.required]],
    lng: ['', [Validators.required]],
    category: ['PATRIMONIO' as CategoriaLugar, [Validators.required]],
    icon: ['landmark'],
    period: [''],
    descText: ['', [Validators.maxLength(1000)]],
    img: ['', [Validators.maxLength(500)]],
  });

  /* Formulario Expresiones Culturales */
  protected readonly formExpresion = this.fb.nonNullable.group({
    id: [''],
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    categoria: ['DANZA' as CategoriaExpresion, [Validators.required]],
    country: ['', [Validators.required]],
    descText: ['', [Validators.required, Validators.maxLength(1000)]],
    imagen: ['', [Validators.maxLength(500)]],
    creditos: ['', [Validators.maxLength(300)]],
  });

  constructor() {
    void this.cargarPaises();

    this.form.controls.name.valueChanges.subscribe((nombre) => {
      if (this.editando() === null && this.form.controls.id.pristine) {
        this.form.controls.id.setValue(sugerirId(nombre), { emitEvent: false });
      }
    });

    this.formExpresion.controls.titulo.valueChanges.subscribe((titulo) => {
      if (this.editando() === null && this.formExpresion.controls.id.pristine) {
        this.formExpresion.controls.id.setValue(sugerirId(titulo), { emitEvent: false });
      }
    });
  }

  private async cargarPaises(): Promise<void> {
    try {
      const lista = await this.countriesService.fetchCountries();
      this.paises.set(lista);
      if (lista.length > 0 && !this.form.controls.country.value) {
        this.form.controls.country.setValue(lista[0].code);
        this.formExpresion.controls.country.setValue(lista[0].code);
      }
    } catch {
      this.paises.set(this.store.countries());
    }
  }

  protected cambiarTipo(tipo: TipoGestion): void {
    this.tipoGestion.set(tipo);
    this.cancelarEdicion();
    this.error.set(null);
    this.aviso.set(null);
  }

  /* ---------------- Edición Lugares ---------------- */
  protected editar(l: Lugar): void {
    this.error.set(null);
    this.aviso.set(null);
    this.confirmando.set(null);
    this.editando.set(l.id);

    this.form.reset({
      id: l.id,
      name: l.name,
      country: l.country,
      lat: String(l.coords[0]),
      lng: String(l.coords[1]),
      category: l.category,
      icon: l.icon || 'landmark',
      period: l.period || '',
      descText: l.desc || '',
      img: l.img || '',
    });
    this.form.controls.id.disable();
  }

  /* ---------------- Edición Expresiones ---------------- */
  protected editarExpresion(e: ExpresionCultural): void {
    this.error.set(null);
    this.aviso.set(null);
    this.confirmando.set(null);
    this.editando.set(e.id);

    this.formExpresion.reset({
      id: e.id,
      titulo: e.titulo,
      categoria: e.categoria,
      country: e.paisCode,
      descText: e.desc,
      imagen: e.imagenUrl || '',
      creditos: e.creditos || '',
    });
    this.formExpresion.controls.id.disable();
  }

  protected cancelarEdicion(): void {
    this.editando.set(null);
    this.confirmando.set(null);
    this.form.reset({
      id: '',
      name: '',
      country: this.paises()[0]?.code || '',
      lat: '',
      lng: '',
      category: 'PATRIMONIO',
      icon: 'landmark',
      period: '',
      descText: '',
      img: '',
    });
    this.form.controls.id.enable();

    this.formExpresion.reset({
      id: '',
      titulo: '',
      categoria: 'DANZA',
      country: this.paises()[0]?.code || '',
      descText: '',
      imagen: '',
      creditos: '',
    });
    this.formExpresion.controls.id.enable();
  }

  /* ---------------- Guardar Lugar ---------------- */
  protected async guardarLugar(): Promise<void> {
    this.error.set(null);
    this.aviso.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Corrige los campos marcados antes de guardar.');
      return;
    }

    const val = this.form.getRawValue();
    const esAlta = this.editando() === null;

    if (esAlta && !idValido(val.id)) {
      this.error.set('El identificador solo admite minúsculas, dígitos y guión bajo.');
      return;
    }

    const lat = Number(val.lat);
    const lng = Number(val.lng);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      this.error.set('La latitud debe ser un número entre -90 y 90.');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      this.error.set('La longitud debe ser un número entre -180 y 180.');
      return;
    }

    const req: LugarRequest = {
      id: esAlta ? val.id : null,
      name: val.name.trim(),
      country: val.country,
      lat,
      lng,
      category: val.category,
      icon: textoOpcional(val.icon),
      period: textoOpcional(val.period),
      descText: textoOpcional(val.descText),
      img: textoOpcional(val.img),
    };

    this.guardando.set(true);
    try {
      if (esAlta) {
        await this.places.crear(req);
        this.aviso.set(`Lugar "${req.name}" creado con éxito.`);
      } else {
        await this.places.actualizar(this.editando()!, req);
        this.aviso.set(`Lugar "${req.name}" actualizado.`);
      }
      this.cancelarEdicion();
      await this.store.recargarLugares();
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.guardando.set(false);
    }
  }

  /* ---------------- Guardar Expresión Cultural ---------------- */
  protected guardarExpresion(): void {
    this.error.set(null);
    this.aviso.set(null);

    if (this.formExpresion.invalid) {
      this.formExpresion.markAllAsTouched();
      this.error.set('Corrige los campos marcados antes de guardar.');
      return;
    }

    const val = this.formExpresion.getRawValue();
    const esAlta = this.editando() === null;

    if (esAlta && !idValido(val.id)) {
      this.error.set('El identificador solo admite minúsculas, dígitos y guión bajo.');
      return;
    }

    const req = {
      id: esAlta ? val.id : null,
      titulo: val.titulo.trim(),
      categoria: val.categoria,
      country: val.country,
      descText: val.descText.trim(),
      imagen: textoOpcional(val.imagen),
      creditos: textoOpcional(val.creditos),
    };

    this.guardando.set(true);
    const op = esAlta
      ? this.expressionsService.crear(req)
      : this.expressionsService.actualizar(this.editando()!, req);

    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.aviso.set(`Expresión "${req.titulo}" guardada con éxito.`);
        this.cancelarEdicion();
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(mensajeDeError(e));
      },
    });
  }

  /* ---------------- Borrado ---------------- */
  protected pedirBorrado(id: string): void {
    this.confirmando.set(id);
  }

  protected cancelarBorrado(): void {
    this.confirmando.set(null);
  }

  protected async confirmarBorradoLugar(id: string): Promise<void> {
    this.borrando.set(id);
    this.error.set(null);
    try {
      await this.places.eliminar(id);
      this.confirmando.set(null);
      this.aviso.set('Lugar eliminado.');
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

  protected confirmarBorradoExpresion(id: string): void {
    this.borrando.set(id);
    this.error.set(null);
    this.expressionsService.eliminar(id).subscribe({
      next: () => {
        this.borrando.set(null);
        this.confirmando.set(null);
        this.aviso.set('Expresión cultural eliminada.');
        if (this.editando() === id) {
          this.cancelarEdicion();
        }
      },
      error: (e) => {
        this.borrando.set(null);
        this.error.set(mensajeDeError(e));
      },
    });
  }

  protected tituloFormulario(): string {
    const id = this.editando();
    const esLugar = this.tipoGestion() === 'lugares';
    if (id === null) {
      return esLugar ? 'Nuevo lugar patrimonial' : 'Nueva expresión cultural';
    }
    const nombre = esLugar
      ? this.form.getRawValue().name.trim()
      : this.formExpresion.getRawValue().titulo.trim();
    return nombre === '' ? `Editando ${id}` : `Editando: ${nombre}`;
  }

  protected textoBoton(): string {
    if (this.guardando()) return 'Guardando…';
    return this.editando() === null ? 'Crear' : 'Guardar cambios';
  }

  protected controlMarcado(name: string): boolean {
    const control =
      this.tipoGestion() === 'lugares'
        ? this.form.get(name)
        : this.formExpresion.get(name);
    return !!control && control.touched && control.invalid;
  }
}

function textoOpcional(valor: string): string | null {
  const limpio = valor.trim();
  return limpio === '' ? null : limpio;
}
