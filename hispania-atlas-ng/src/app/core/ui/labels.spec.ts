/**
 * src/app/core/ui/labels.spec.ts
 *
 * Las etiquetas son la única traducción entre los enums del backend y lo que ve
 * la persona. Si una categoría nueva se añade al tipo y nadie la traduce, la
 * interfaz vuelve a mostrar `PAISAJE_NATURAL` en mayúsculas, que es exactamente
 * el hallazgo H2-01 de la evaluación heurística.
 *
 * Estas pruebas atan las dos listas: toda categoría declara etiqueta y
 * descripción, y ninguna etiqueta repite el valor interno.
 */
import {
  DESCRIPCION_CATEGORIA_LUGAR,
  ETIQUETA_CATEGORIA_LUGAR,
  ETIQUETA_ICONO,
  etiquetaCategoria,
  etiquetaCategoriaExpresion,
  etiquetaIcono,
} from './labels';
import type { CategoriaExpresion, CategoriaLugar } from '../models';
import { CATEGORIAS_EXPRESION } from '../models';

const CATEGORIAS_LUGAR = Object.keys(ETIQUETA_CATEGORIA_LUGAR) as CategoriaLugar[];
const CATEGORIAS_EXPRESION_TODAS = Object.keys(CATEGORIAS_EXPRESION) as CategoriaExpresion[];

describe('etiquetas de categorías de lugar', () => {
  it('traduce todas las categorías del dominio', () => {
    for (const categoria of CATEGORIAS_LUGAR) {
      expect(etiquetaCategoria(categoria)).toBe(ETIQUETA_CATEGORIA_LUGAR[categoria]);
      expect(etiquetaCategoria(categoria)).toBeTruthy();
    }
  });

  it('no deja ninguna categoría con el enum crudo', () => {
    // Las categorías de una sola palabra coinciden con su etiqueta (ARTE →
    // "Arte"); las compuestas son las que delatan una traducción olvidada.
    for (const categoria of CATEGORIAS_LUGAR.filter((c) => c.includes('_'))) {
      expect(etiquetaCategoria(categoria)).not.toBe(categoria);
    }
  });

  it('explica cada categoría, para elegir sin memorizar', () => {
    for (const categoria of CATEGORIAS_LUGAR) {
      const descripcion = DESCRIPCION_CATEGORIA_LUGAR[categoria];
      expect(descripcion).toBeTruthy();
      expect(descripcion.length).toBeGreaterThan(20);
    }
  });

  it('devuelve el valor recibido si el backend añade una categoría desconocida', () => {
    // Preferible mostrar el valor nuevo a pintar "undefined": así se detecta el
    // desfase en la revisión sin romper la vista.
    expect(etiquetaCategoria('CATEGORIA_FUTURA')).toBe('CATEGORIA_FUTURA');
    expect(etiquetaCategoria('')).toBe('');
  });
});

describe('etiquetas de expresiones culturales', () => {
  it('traduce todas las categorías de expresión', () => {
    for (const categoria of CATEGORIAS_EXPRESION_TODAS) {
      expect(etiquetaCategoriaExpresion(categoria)).toBe(CATEGORIAS_EXPRESION[categoria]);
      expect(etiquetaCategoriaExpresion(categoria)).toBeTruthy();
    }
  });

  it('no deja categorías de expresión sin traducir', () => {
    for (const categoria of CATEGORIAS_EXPRESION_TODAS.filter((c) => c.includes('_'))) {
      expect(etiquetaCategoriaExpresion(categoria)).not.toBe(categoria);
    }
  });
});

describe('etiquetas de iconos', () => {
  it('traduce los iconos que usa el catálogo', () => {
    expect(etiquetaIcono('landmark')).toBe('Monumento');
    expect(etiquetaIcono('palette')).toBe('Arte');
    expect(etiquetaIcono('tree')).toBe('Naturaleza');
  });

  it('no devuelve nombres técnicos en inglés para los iconos conocidos', () => {
    for (const [clave, etiqueta] of Object.entries(ETIQUETA_ICONO)) {
      expect(etiqueta).not.toBe(clave);
    }
  });

  it('trata la ausencia de icono como un estado explícito', () => {
    expect(etiquetaIcono(null)).toBe('Sin icono');
    expect(etiquetaIcono(undefined)).toBe('Sin icono');
    expect(etiquetaIcono('')).toBe('Sin icono');
  });

  it('deja pasar un icono desconocido en lugar de ocultarlo', () => {
    expect(etiquetaIcono('objeto-nuevo')).toBe('objeto-nuevo');
  });
});
