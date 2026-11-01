/**
 * src/app/core/auth/roles.ts
 *
 * Espejo frontend de la clase `Jerarquia` del backend
 * (`com.hispania.config.Jerarquia`). Los dos archivos tienen que coincidir,
 * y esa es la razón de que el rango sea un número explícito y no un `enum`.
 *
 * El rango es un entero porque la jerarquía es **lineal**: cada rol puede todo
 * lo que puede el anterior. Así no hay una tabla de permisos que mantener, solo
 * una comparación. En el backend lo resuelve el método `incluye()` del enum
 * `Rol`; aquí se resuelve restando números.
 *
 * Ojo con el signo, porque aquí ya no hay un solo tipo de comparación. `puede`
 * compara `>=`, `puedeModificar` usa `>` porque solo se toca a quien está por
 * debajo, y `puedeProponer` va al revés, con `<=`, porque es la única regla que
 * excluye en lugar de incluir. El sentido correcto depende de la regla, no del
 * archivo.
 */
import type { Rol } from '../models';

const RANGO: Record<Rol, number> = {
  USUARIO: 0,
  COLABORADOR: 1,
  ADMIN: 2,
  ADMIN_SISTEMA: 3,
};

/** Etiquetas en castellano para la interfaz. El enum es un nombre de máquina. */
export const ETIQUETA_ROL: Record<Rol, string> = {
  USUARIO: 'Usuario',
  COLABORADOR: 'Colaborador',
  ADMIN: 'Administrador',
  ADMIN_SISTEMA: 'Administrador del sistema',
};

/**
 * ¿El rol actual llega al mínimo exigido?
 *
 * Devolver `false` en lugar de lanzar es lo que permite usarla en la plantilla
 * con `@if (auth.puede('ADMIN'))`, que es donde se decide qué botones pintar.
 * La comprobación de verdad no está aquí: la hace el backend en cada petición.
 * Esto solo evita mostrar un botón que el servidor iba a rechazar.
 */
export function puede(actual: Rol | null, minimo: Rol): boolean {
  if (actual === null) {
    return false;
  }
  return RANGO[actual] >= RANGO[minimo];
}

/** Rango numérico de un rol, útil para ordenar listados de administración. */
export function rango(rol: Rol): number {
  return RANGO[rol];
}

/**
 * ¿El actual puede proponer un lugar? Espejo de `Jerarquia.puedeProponer`.
 *
 * Es la única regla del módulo que **excluye** en lugar de incluir, y por eso
 * no sale de `puede` con un mínimo. La idea es la de toda la cola de propuestas:
 * es un rodeo para quien ya puede crear el lugar por la vía directa. Un ADMIN
 * podría meterlo con un POST sin que nadie lo apruebe, así que proponer le
 * añade un paso sin añadirle nada.
 *
 * El `COLABORADOR` sigue proposing aunque también pueda crear directamente: las
 * dos vías son suyas, y nada obligaba a quitarle una.
 *
 * @param actual rol de quien intenta la acción; `null` si no hay sesión
 */
export function puedeProponer(actual: Rol | null): boolean {
  if (actual === null) {
    return false;
  }
  return RANGO[actual] <= RANGO.COLABORADOR;
}

/**
 * ¿El actual puede modificar a `objetivo`? Espejo de `Jerarquia.puedeModificar`.
 *
 * Dos condiciones, y las dos importan:
 *
 *  - Rango **estrictamente** superior. Aquí es donde un `>=` colaría un
 *    agujero, porque dejaría a dos administradores modificándose entre sí. Es
 *    el error que fija el test de igualdad.
 *  - Que no sea uno mismo. Sin esto, un administrador se degradaría a sí mismo
 *    con un clic y se quedaría sin permisos.
 *
 * @param actual   rol de quien intenta la acción; `null` si no hay sesión
 * @param objetivo rol de la cuenta que se quiere afectar
 * @param mismoId  id de la cuenta de quien actúa, para detectar el caso
 *                  "me estoy modificando a mí"; `null` si se desconoce
 * @param objetivoId id de la cuenta afectada
 */
export function puedeModificar(actual: Rol | null, objetivo: Rol, mismoId: number | null, objetivoId: number): boolean {
  if (actual === null || mismoId === null) {
    return false;
  }
  if (mismoId === objetivoId) {
    return false;
  }
  return RANGO[actual] > RANGO[objetivo];
}

/**
 * ¿El actual puede asignar `nuevo`? Espejo de `Jerarquia.puedeAsignar`.
 *
 * Es "menor o igual", a diferencia del caso anterior, y el matiz es
 * intencionado: un `ADMIN` sí puede crear otro `ADMIN`. Lo que no puede es
 * crear un `ADMIN_SISTEMA`, porque Eso sería delegar un poder que no tiene y
 * convertir una cuenta intermedia en un escalón hacia el control total.
 */
export function puedeAsignar(actual: Rol | null, nuevo: Rol): boolean {
  if (actual === null) {
    return false;
  }
  return RANGO[nuevo] <= RANGO[actual];
}

/** Todos los roles, de menor a mayor, para pintar un desplegable. */
export const ROLES: readonly Rol[] = ['USUARIO', 'COLABORADOR', 'ADMIN', 'ADMIN_SISTEMA'];
