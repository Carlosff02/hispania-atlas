/**
 * src/app/core/data/countries.ts
 *
 * Datos de respaldo (fallback) que se usan cuando el backend Spring Boot no
 * está levantado. En `ng serve` con el proxy configurado normalmente se leen
 * del backend; estos datos mantienen la app usable offline.
 *
 * NOTA de migración: en la versión React este archivo declaraba sus propias
 * interfaces `PaisRaw` / `Pais` (con `flagUrl` y `flagEmoji`, que ningún
 * componente usaba). Aquí se reutiliza el `Pais` único de `core/models`, así
 * el fallback y la respuesta de la API son el mismo tipo y no hace falta
 * ningún cast al mezclarlos.
 */
import type { Pais, Region } from '../models';

interface PaisRaw {
  code: string;
  name: string;
  capital: string;
  coords: [number, number];
  region: Region;
  gdp: number;
  gdpPc: number;
  pop: number;
  growth: number;
  inflation: number;
  exports: number;
  imports: number;
  hdi: number;
  debt: number;
  trade: number;
  desc?: string;
  topExports?: string[];
}

const years: number[] = Array.from({ length: 27 }, (_, i) => 2000 + i);

function buildSeries(gdp26: number, g: number, seed: number) {
  const out: { year: number; gdp: number }[] = [];
  let v = gdp26;
  for (let i = years.length - 1; i >= 0; i--) {
    out[i] = { year: years[i], gdp: Math.round(v * 10) / 10 };
    v = v / (1 + g / 100 + Math.sin((i + seed) * 1.7) * 0.02);
  }
  return out;
}

export const COLORS: Record<string, string> = {
  MX: '#5c8063', GT: '#6eb5b5', SV: '#b56e6e', HN: '#b5a36e', NI: '#8c6eb5',
  CR: '#6e8cb5', PA: '#b56eb5', CU: '#9c5c5c', DO: '#5c7a9c', PR: '#7a9c5c',
  VE: '#8d995c', CO: '#cca743', EC: '#608f9c', PE: '#b88d45', BO: '#965c5c',
  PY: '#73637a', UY: '#60708f', AR: '#689bb5', CL: '#a84a4a',
};

const RAW: PaisRaw[] = [
  // Norteamérica
  { code: 'MX', name: 'México', capital: 'Ciudad de México', coords: [23.6, -102.5], region: 'Norteamérica', gdp: 2121, gdpPc: 15779, pop: 133.4, growth: 2.4, inflation: 3.9, exports: 610, imports: 598, hdi: 0.781, debt: 52, trade: 1208, desc: 'Vasta república septentrional; cuna del muralismo y epicentro del barroco novohispano.', topExports: ['Manufacturas', 'Petróleo', 'Maquinaria'] },

  // Centroamérica
  { code: 'GT', name: 'Guatemala', capital: 'Ciudad de Guatemala', coords: [15.7, -90.2], region: 'Centroamérica', gdp: 102, gdpPc: 5700, pop: 17.1, growth: 3.5, inflation: 4.1, exports: 15.2, imports: 32.1, hdi: 0.627, debt: 29, trade: 47.3, desc: 'Corazón del mundo maya, país de montañas, volcanes y bosques profundos.', topExports: ['Ropa', 'Café', 'Banano'] },
  { code: 'SV', name: 'El Salvador', capital: 'San Salvador', coords: [13.7, -88.9], region: 'Centroamérica', gdp: 34, gdpPc: 5300, pop: 6.3, growth: 2.2, inflation: 3.8, exports: 7.1, imports: 15.6, hdi: 0.675, debt: 76, trade: 22.7, desc: 'El Pulgarcito de América, pionero en adopción de criptomonedas.', topExports: ['Textiles', 'Plásticos', 'Café'] },
  { code: 'HN', name: 'Honduras', capital: 'Tegucigalpa', coords: [15.2, -86.2], region: 'Centroamérica', gdp: 34, gdpPc: 3200, pop: 10.4, growth: 3.0, inflation: 5.2, exports: 12.1, imports: 18.5, hdi: 0.621, debt: 50, trade: 30.6, desc: 'Tierra montañosa con rica biodiversidad y barreras de coral caribeñas.', topExports: ['Ropa', 'Café', 'Aceite de palma'] },
  { code: 'NI', name: 'Nicaragua', capital: 'Managua', coords: [12.9, -85.2], region: 'Centroamérica', gdp: 17, gdpPc: 2500, pop: 6.9, growth: 3.1, inflation: 6.5, exports: 7.3, imports: 11.2, hdi: 0.667, debt: 42, trade: 18.5, desc: 'Tierra de lagos y volcanes, con vasta reserva de biósfera.', topExports: ['Oro', 'Textiles', 'Café'] },
  { code: 'CR', name: 'Costa Rica', capital: 'San José', coords: [9.7, -83.7], region: 'Centroamérica', gdp: 86, gdpPc: 16500, pop: 5.1, growth: 4.2, inflation: 0.8, exports: 18.5, imports: 22.1, hdi: 0.809, debt: 61, trade: 40.6, desc: 'Pionero mundial en ecoturismo, conservación y energía renovable.', topExports: ['Equipos médicos', 'Banano', 'Piña'] },
  { code: 'PA', name: 'Panamá', capital: 'Ciudad de Panamá', coords: [8.5, -80.0], region: 'Centroamérica', gdp: 83, gdpPc: 18900, pop: 4.4, growth: 5.0, inflation: 1.5, exports: 15.8, imports: 31.2, hdi: 0.805, debt: 54, trade: 47.0, desc: 'Hub logístico global; puente del mundo que une dos océanos.', topExports: ['Cobre', 'Banano', 'Medicamentos'] },

  // Caribe
  { code: 'CU', name: 'Cuba', capital: 'La Habana', coords: [21.5, -77.8], region: 'Caribe', gdp: 107, gdpPc: 9500, pop: 11.2, growth: -1.5, inflation: 30.0, exports: 1.8, imports: 8.5, hdi: 0.764, debt: 115, trade: 10.3, desc: 'Famosa por su música, tabaco y arquitectura colonial.', topExports: ['Tabaco', 'Níquel', 'Azúcar'] },
  { code: 'DO', name: 'Rep. Dominicana', capital: 'Santo Domingo', coords: [18.7, -70.1], region: 'Caribe', gdp: 121, gdpPc: 11200, pop: 11.2, growth: 4.8, inflation: 4.0, exports: 12.9, imports: 26.5, hdi: 0.767, debt: 58, trade: 39.4, desc: 'Líder turístico del Caribe, hogar de hermosas playas y merengue.', topExports: ['Oro', 'Instrumentos médicos', 'Cigarros'] },
  { code: 'PR', name: 'Puerto Rico', capital: 'San Juan', coords: [18.2, -66.5], region: 'Caribe', gdp: 113, gdpPc: 35000, pop: 3.2, growth: 0.5, inflation: 3.1, exports: 73.1, imports: 51.5, hdi: 0.840, debt: 70, trade: 124.6, desc: 'La Isla del Encanto, mezcla de herencia taína, española y africana.', topExports: ['Fármacos', 'Equipos médicos', 'Electrónica'] },

  // Andina
  { code: 'VE', name: 'Venezuela', capital: 'Caracas', coords: [6.4, -66.5], region: 'Andina', gdp: 97, gdpPc: 3400, pop: 28.3, growth: 4.0, inflation: 190.0, exports: 8.5, imports: 11.2, hdi: 0.691, debt: 150, trade: 19.7, desc: 'País de maravillas naturales, desde los Andes hasta el Salto Ángel.', topExports: ['Petróleo', 'Oro', 'Aluminio'] },
  { code: 'CO', name: 'Colombia', capital: 'Bogotá', coords: [4.5, -74.0],
    region: 'Andina',
    gdp: 539, gdpPc: 10100, pop: 51.8, growth: 1.5, inflation: 9.2, exports: 49.5, imports: 62.8, hdi: 0.752, debt: 55, trade: 112.3, desc: 'Puerta de entrada a Sudamérica, rica en café y esmeraldas.', topExports: ['Petróleo', 'Carbón', 'Café'] },
  { code: 'EC', name: 'Ecuador', capital: 'Quito', coords: [-1.8, -78.1], region: 'Andina', gdp: 121, gdpPc: 6800, pop: 18.0, growth: 1.8, inflation: 2.2, exports: 31.1, imports: 30.5, hdi: 0.740, debt: 62, trade: 61.6, desc: 'El país de los cuatro mundos, guardián de las Islas Galápagos.', topExports: ['Petróleo', 'Camarón', 'Banano'] },
  { code: 'PE', name: 'Perú', capital: 'Lima',
    coords: [-9.2, -75.0],
    region: 'Andina',
    gdp: 380, gdpPc: 10960, pop: 34.4, growth: 3.1, inflation: 2.6, exports: 68.9,
    imports: 52.3, hdi: 0.796, debt: 34, trade: 121.2, desc: 'Antiguo epicentro virreinal; capital gastronómica de América.',
    topExports: ['Cobre', 'Oro', 'Harina de pescado'] },
  { code: 'BO', name: 'Bolivia', capital: 'Sucre / La Paz', coords: [-16.2, -68.1], region: 'Andina', gdp: 45, gdpPc: 3700, pop: 12.2, growth: 2.2, inflation: 2.1, exports: 10.9, imports: 11.5, hdi: 0.692, debt: 82, trade: 22.4, desc: 'Corazón de Sudamérica, hogar del místico Salar de Uyuni.', topExports: ['Gas natural', 'Oro', 'Zinc'] },

  // Cono Sur
  { code: 'PY', name: 'Paraguay', capital: 'Asunción', coords: [-23.4, -58.3],
    region: 'Cono Sur', gdp: 42, gdpPc: 5700, pop: 7.3, growth: 4.5, inflation: 3.7,
    exports: 11.9, imports: 15.5, hdi: 0.717, debt: 38, trade: 27.4,
    desc: 'Tierra bilingüe impulsada por inmensas represas hidroeléctricas.', topExports: ['Soya', 'Carne bovina', 'Energía'] },
  { code: 'UY', name: 'Uruguay', capital: 'Montevideo', coords: [-32.5, -55.7],
    region: 'Cono Sur', gdp: 77, gdpPc: 22500, pop: 3.4, growth: 3.2, inflation: 5.1,
    exports: 13.5, imports: 12.8, hdi: 0.809, debt: 60, trade: 26.3,
    desc: 'Nación austral de amplias llanuras y altos estándares sociales.', topExports: ['Carne bovina', 'Celulosa', 'Lácteos'] },
  { code: 'AR', name: 'Argentina', capital: 'Buenos Aires', coords: [-35.5, -64.5],
    region: 'Cono Sur', gdp: 664, gdpPc: 14100, pop: 47.1, growth: 2.1, inflation: 38.0,
    exports: 92.4, imports: 78.6, hdi: 0.849, debt: 88, trade: 171.0,
    desc: 'Polo irradiador de cultura, sede de la sensualidad del tango.', topExports: ['Soya', 'Trigo', 'Cueros'] },
  { code: 'CL', name: 'Chile', capital: 'Santiago', coords: [-35.6, -71.5],
    region: 'Cono Sur', gdp: 407, gdpPc: 20240, pop: 19.5, growth: 1.9, inflation: 4.5,
    exports: 94.5, imports: 85.2, hdi: 0.855, debt: 38, trade: 179.7,
    desc: 'Larga y angosta faja de tierra de contrastes extremos.', topExports: ['Cobre', 'Salmón', 'Litio'] }
];

/** Datos de countries.ts ya enriquecidos con color y serie histórica. */
export const countries: Pais[] = RAW.map((c, i) => ({
  ...c,
  color: COLORS[c.code] ?? '#000000',
  series: buildSeries(c.gdp, Math.max(1.5, c.growth + 1.6), i + 1),
}));

/** Índice O(1) por código de país. Sustituye al `.find()` en listas largas. */
export const byCode: Record<string, Pais> = Object.fromEntries(
  countries.map((c) => [c.code, c])
);
