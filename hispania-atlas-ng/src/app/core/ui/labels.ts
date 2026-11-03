/**
 * Etiquetas legibles para los valores internos del dominio.
 *
 * Las categorías viajan en mayúsculas porque son enums del backend
 * (`PATRIMONIO`, `PAISAJE_NATURAL`…). Pintarlas tal cual obliga a la persona a
 * traducir el dato interno, que es justo lo que la heurística 2 ("coincidencia
 * entre el sistema y el mundo real") pide evitar. Aquí viven las traducciones
 * para que todas las vistas usen la misma palabra.
 */
import type { CategoriaExpresion, CategoriaLugar } from '../models';
import { CATEGORIAS_EXPRESION } from '../models';

export const ETIQUETA_CATEGORIA_LUGAR: Record<CategoriaLugar, string> = {
  ARTE: 'Arte',
  DANZA: 'Danza',
  ARQUEOLOGIA: 'Arqueología',
  PATRIMONIO: 'Patrimonio',
  HISTORICO: 'Histórico',
  INFRAESTRUCTURA: 'Infraestructura',
  PAISAJE_NATURAL: 'Paisaje natural',
  ACADEMICO: 'Académico',
  GASTRONOMICO: 'Gastronómico',
};

/** Texto de ayuda de cada categoría, para elegir sin memorizar el enum. */
export const DESCRIPCION_CATEGORIA_LUGAR: Record<CategoriaLugar, string> = {
  ARTE: 'Obras, museos y espacios de creación artística.',
  DANZA: 'Espacios vinculados a la danza y la música.',
  ARQUEOLOGIA: 'Yacimientos, ruinas y sitios excavados.',
  PATRIMONIO: 'Monumentos y conjuntos declarados patrimonio.',
  HISTORICO: 'Lugares con un papel relevante en la historia.',
  INFRAESTRUCTURA: 'Obras civiles de valor cultural (puentes, acueductos).',
  PAISAJE_NATURAL: 'Valles, reservas y formaciones geológicas.',
  ACADEMICO: 'Universidades, institutos y campus históricos.',
  GASTRONOMICO: 'Mercados, rutas de café y tradiciones culinarias.',
};

export const ETIQUETA_ICONO: Record<string, string> = {
  landmark: 'Monumento',
  building: 'Edificio',
  palette: 'Arte',
  music: 'Música',
  tree: 'Naturaleza',
};

/** Traduce una categoría de lugar; si llega un valor nuevo, lo muestra crudo. */
export function etiquetaCategoria(categoria: string): string {
  return (ETIQUETA_CATEGORIA_LUGAR as Record<string, string>)[categoria] ?? categoria;
}

/** Traduce una categoría de expresión cultural. */
export function etiquetaCategoriaExpresion(categoria: CategoriaExpresion): string {
  return CATEGORIAS_EXPRESION[categoria];
}

/** Traduce el nombre interno de un icono. */
export function etiquetaIcono(icono: string | null | undefined): string {
  if (!icono) return 'Sin icono';
  return ETIQUETA_ICONO[icono] ?? icono;
}
