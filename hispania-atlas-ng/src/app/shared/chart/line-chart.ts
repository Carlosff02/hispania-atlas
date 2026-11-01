/**
 * src/app/shared/chart/line-chart.ts
 *
 * Envoltura mínima sobre Chart.js. La versión React usaba el componente
 * `<Line>` de `react-chartjs-2`, que no tiene equivalente directo en Angular:
 * ahí los gráficos se controlan de forma imperativa, con la instanciación en
 * el `afterNextRender` y la destrucción en `ngOnDestroy`.
 *
 * Los inputs por signal son la diferencia clave frente al `<Line data={...}>`
 * de React: cuando el signal `data` cambia, el efecto que depende de él
 * actualiza el gráfico en el sitio, sin recrearlo. Recrearlo en cada cambio
 * perdería la animación de transición de las líneas y filtraría listeners.
 */
import {
  afterNextRender,
  Component,
  ElementRef,
  effect,
  input,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import {
  CategoryScale,
  Chart,
  ChartData,
  ChartOptions,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

/*
 * Chart.js exige "registrar" las piezas que se van a usar: es su forma de
 * mantener el bundle pequeño. Si se olvida alguna, Chart.js lanza un error
 * explícito en consola diciendo qué módulo falta. Se registra a nivel de módulo
 * para que ocurra una sola vez y antes de que se cree cualquier gráfico.
 *
 * Nota: `import ... from 'chart.js'` trae el paquete completo, pero el registro
 * explícito de piezas es lo que permite que el tree-shaking descarte el resto.
 */
Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-line-chart',
  template: '<canvas #canvasEl></canvas>',
  styles: ':host { display: block; position: relative; }',
})
export class LineChart implements OnDestroy {
  readonly data = input.required<ChartData<'line'>>();
  readonly options = input<ChartOptions<'line'>>({
    responsive: true,
    maintainAspectRatio: false,
  });

  private readonly canvasEl = viewChild.required<ElementRef<HTMLCanvasElement>>('canvasEl');

  private chart: Chart<'line'> | null = null;

  /**
   * Marca que el `<canvas>` ya existe. Se usa como dependencia del efecto de
   * actualización: leer un signal es la única forma que tiene un `effect` de
   * saber que debe volver a correr cuando cambia algo que no es signal (en este
   * caso, la creación imperativa del chart).
   */
  private readonly ready = signal(false);

  constructor() {
    afterNextRender(() => {
      this.chart = new Chart(this.canvasEl().nativeElement, {
        type: 'line',
        data: this.data(),
        options: this.options(),
      });
      this.ready.set(true);
    });

    effect(() => {
      const data = this.data();
      const options = this.options();
      if (!this.ready()) return;

      const chart = this.chart;
      if (!chart) return;

      chart.data = data;
      chart.options = options;
      chart.update();
    });
  }

  ngOnDestroy(): void {
    // Sin destroy() Chart.js deja el canvas observation loop y los listeners de
    // resize activos, y fuga memoria en cada navegación fuera de la vista.
    this.chart?.destroy();
    this.chart = null;
  }
}
