/**
 * src/app/core/data/milestones.ts
 *
 * Cronología de hitos histórico/artes/infraestructura. Contenido editorial
 * estático (no viene del backend), igual que `artData`.
 */
import type { Hito } from '../models';

export const milestones: Hito[] = [
  { year: 1539, title: 'Primera Imprenta de América', country: 'MX', type: 'Arte', desc: 'El obispo Zumárraga introduce la imprenta, sentando las bases para la literatura novohispana.' },
  { year: 1680, title: 'Apogeo de la Escuela Cusqueña', country: 'PE', type: 'Arte', desc: 'El Obispo Mollinedo promueve un intenso mecenazgo artístico, propulsando a pintores como Diego Quispe Tito.' },
  { year: 1824, title: 'Batalla de Ayacucho', country: 'PE', type: 'Historia', desc: 'Victoria definitiva que sella la independencia de las repúblicas sudamericanas.' },
  { year: 1914, title: 'Apertura del Canal', country: 'PA', type: 'Infraestructura', desc: 'La vía acuática une el Atlántico y el Pacífico, alterando la geopolítica mundial.' },
  { year: 1922, title: 'Inicio del Muralismo Mexicano', country: 'MX', type: 'Arte', desc: 'Artistas como Rivera, Siqueiros y Orozco plasman ideales sociales en muros públicos.' },
];
