/**
 * Diálogo de confirmación reutilizable.
 *
 * Existe para que las acciones irreversibles (aprobar una propuesta, eliminar
 * un lugar, desactivar una cuenta) no dependan de un `window.confirm`, que no
 * se puede estilar ni traducir y bloquea el hilo. Además concentra en un solo
 * sitio el comportamiento accesible: `role="alertdialog"`, foco inicial en el
 * botón de confirmar, cierre con Escape y bloqueo del scroll de fondo.
 */
import {
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  host: { '(document:keydown.escape)': 'alPulsarEscape()' },
})
export class ConfirmDialog {
  readonly abierto = input(false);
  readonly titulo = input('¿Confirmas la acción?');
  readonly mensaje = input('');
  readonly textoConfirmar = input('Confirmar');
  readonly textoCancelar = input('Cancelar');
  readonly tono = input<'primario' | 'peligro'>('primario');

  readonly confirmado = output<void>();
  readonly cancelado = output<void>();

  private readonly botonConfirmar =
    viewChild<ElementRef<HTMLButtonElement>>('botonConfirmar');

  constructor() {
    effect((onCleanup) => {
      if (!this.abierto()) return;

      const focoAnterior = document.activeElement as HTMLElement | null;
      const overflowAnterior = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      queueMicrotask(() => this.botonConfirmar()?.nativeElement.focus());

      onCleanup(() => {
        document.body.style.overflow = overflowAnterior;
        focoAnterior?.focus();
      });
    });
  }

  protected confirmar(): void {
    this.confirmado.emit();
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }

  protected alPulsarEscape(): void {
    if (this.abierto()) this.cancelar();
  }

  protected claseConfirmar(): string {
    const base =
      'px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] rounded-sm transition-colors';
    return this.tono() === 'peligro'
      ? `${base} bg-red-600 text-white hover:bg-red-500`
      : `${base} bg-brass text-vicblue hover:bg-brass-light`;
  }
}
