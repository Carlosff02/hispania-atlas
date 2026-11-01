import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ChartData } from 'chart.js';

import { AppStore } from '../../core/state/app.store';
import { LineChart } from '../../shared/chart/line-chart';
import type { Pais } from '../../core/models';

type Indicador = 'gdp' | 'gdpPc' | 'pop' | 'hdi';

interface IndicadorDef {
  id: Indicador;
  label: string;
}

const INDICADORES: IndicadorDef[] = [
  { id: 'gdp', label: 'PBI Total (B USD)' },
  { id: 'gdpPc', label: 'PBI per cápita' },
  { id: 'pop', label: 'Población (M)' },
  { id: 'hdi', label: 'IDH' },
];

/** Países con los que arranca la comparación. */
const SELECCION_INICIAL = ['MX', 'AR', 'CO', 'PE', 'CL'];

/**
 * Registros macroeconómicos comparados. Equivalente de `datos/Datos.tsx`.
 *
 * Estado local (`signal`) para la selección de países y el indicador activo,
 * igual que en la versión React: son controles de esta pantalla y no-interesta
 * a ninguna otra vista. El `computed` reemplaza al `useMemo` que memorizaba
 * `lineData` y `paisesActivos`.
 *
 * LIMITACIÓN CONOCIDA (heredada del proyecto React): la serie histórica solo
 * trae `year` y `gdp` (`SeriePunto` en core/models). Cambiar el indicador a
 * "Población" o "IDH" actualiza las tarjetas numéricas de cada país, pero la
 * línea del gráfico sigue siendo el PBI, porque es el único valor con serie
 * histórica en el modelo. Para hacerlo falta que el backend exponga la serie
 * de cada métrica.
 */
@Component({
  selector: 'app-datos',
  imports: [NgClass, LineChart],
  templateUrl: './datos.html',
})
export class Datos {
  private readonly store = inject(AppStore);

  protected readonly indicadores = INDICADORES;
  protected readonly seleccionados = signal<string[]>([...SELECCION_INICIAL]);
  protected readonly indicador = signal<Indicador>('gdp');

  protected readonly paises = this.store.countries;

  protected readonly paisesActivos = computed(() => {
    const codes = this.seleccionados();
    return this.store.countries().filter((c) => codes.includes(c.code));
  });

  protected readonly lineData = computed<ChartData<'line'>>(() => {
    const activos = this.paisesActivos();
    const years = activos[0]?.series.map((s) => s.year) ?? [];
    return {
      labels: years,
      datasets: activos.map((c) => ({
        label: c.name,
        data: c.series.map((s) => s.gdp),
        borderColor: c.color,
        backgroundColor: c.color,
        tension: 0.3,
      })),
    };
  });

  protected isSelected(code: string): boolean {
    return this.seleccionados().includes(code);
  }

  protected toggleCountry(code: string): void {
    this.seleccionados.update((prev) => {
      const activo = prev.includes(code);
      if (activo && prev.length <= 1) return prev; // no dejar la lista vacía
      return activo ? prev.filter((c) => c !== code) : [...prev, code];
    });
  }

  protected selectIndicator(id: Indicador): void {
    this.indicador.set(id);
  }

  protected countryClass(code: string): string {
    const base = 'px-3 py-1.5 text-xs border';
    return this.isSelected(code)
      ? `${base} bg-vicblue text-paper-light border-ink font-bold`
      : `${base} bg-paper-light border-paper-border text-ink hover:bg-paper-dark`;
  }

  protected indicatorClass(id: Indicador): string {
    const base = 'px-3 py-1.5 text-xs border';
    return this.indicador() === id
      ? `${base} bg-brass text-ink border-ink font-bold`
      : `${base} bg-paper-light border-paper-border text-ink hover:bg-paper-dark`;
  }

  /** Valor del indicador activo formateado al locale español. */
  protected valor(c: Pais): string {
    return c[this.indicador()].toLocaleString('es');
  }
}
