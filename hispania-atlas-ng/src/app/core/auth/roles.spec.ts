/**
 * src/app/core/auth/roles.spec.ts
 *
 * Esta jerarquía es el espejo de `Jerarquia` de Java, y los dos archivos pueden
 * dejar de coincidir sin que nada se rompa: no comparten tipo ni compilan
 * juntos. Un `>=` donde debería haber un `>` mostraría el botón de administrar
 * usuarios a un administrador que luego recibiría un 403, o al revés.
 *
 * Por eso se fijan las igualdades, no solo el caso evidente: que
 * `ADMIN` incluya a `COLABORADOR` es correcto, pero que `COLABORADOR` incluya a
 * `COLABORADOR` no dice nada del sentido del `>=`, y ahí es donde suele colarse
 * el error.
 */
import { ETIQUETA_ROL, puede, puedeAsignar, puedeModificar, puedeProponer, rango } from './roles';
import type { Rol } from '../models';

describe('jerarquía de roles', () => {
  const ROLES: Rol[] = ['USUARIO', 'COLABORADOR', 'ADMIN', 'ADMIN_SISTEMA'];

  it('deja pasar a quien tiene rango igual o superior', () => {
    expect(puede('COLABORADOR', 'COLABORADOR')).toBe(true);
    expect(puede('ADMIN', 'COLABORADOR')).toBe(true);
    expect(puede('ADMIN_SISTEMA', 'ADMIN')).toBe(true);
  });

  it('impide pasar a quien tiene rango inferior', () => {
    expect(puede('USUARIO', 'COLABORADOR')).toBe(false);
    expect(puede('COLABORADOR', 'ADMIN')).toBe(false);
    expect(puede('ADMIN', 'ADMIN_SISTEMA')).toBe(false);
  });

  it('nunca da permisos a una sesión cerrada', () => {
    for (const minimo of ROLES) {
      expect(puede(null, minimo)).toBe(false);
    }
  });

  it('mantiene el orden lineal que espera el backend', () => {
    const ordenado = [...ROLES].sort((a, b) => rango(a) - rango(b));
    expect(ordenado).toEqual(['USUARIO', 'COLABORADOR', 'ADMIN', 'ADMIN_SISTEMA']);
  });

    it('etiqueta todos los roles, para que la interfaz no muestre el enum', () => {
      for (const rol of ROLES) {
        expect(ETIQUETA_ROL[rol]).toBeTruthy();
        expect(ETIQUETA_ROL[rol]).not.toBe(rol);
      }
    });

    describe('puedeProponer', () => {
      it('deja proponer a USUARIO y a COLABORADOR', () => {
        expect(puedeProponer('USUARIO')).toBe(true);
        // COLABORADOR es la frontera: es el rango más alto que sigue pudiendo proponer.
        expect(puedeProponer('COLABORADOR')).toBe(true);
      });

      it('no deja proponer a los administradores, que ya crean directamente', () => {
        expect(puedeProponer('ADMIN')).toBe(false);
        expect(puedeProponer('ADMIN_SISTEMA')).toBe(false);
      });

      it('es el complemento exacto de tener rango de ADMIN, no un ">=" mal orientado', () => {
        /*
         * Si esta regla se escribiera como `puede(..., 'COLABORADOR')`, que es el
         * patrón de las otras, ADMIN y ADMIN_SISTEMA entrarían: exactamente los dos
         * que deben quedar fuera. Se ata la relación para que el error se vea.
         */
        for (const rol of ROLES) {
          expect(puedeProponer(rol)).toBe(!puede(rol, 'ADMIN'));
        }
      });

      it('no propone sin sesión', () => {
        expect(puedeProponer(null)).toBe(false);
      });
    });
  });


describe('reglas de administración de cuentas', () => {
  const YO = 1;
  const OTRO = 2;

  describe('puedeModificar', () => {
    it('exige rango estrictamente superior', () => {
      // La igualdad es el caso importante: con un >=, dos ADMIN se modificarían
      // entre sí y cada uno podría degradar al otro.
      expect(puedeModificar('ADMIN', 'COLABORADOR', YO, OTRO)).toBe(true);
      expect(puedeModificar('ADMIN_SISTEMA', 'ADMIN', YO, OTRO)).toBe(true);

      expect(puedeModificar('ADMIN', 'ADMIN', YO, OTRO)).toBe(false);
      expect(puedeModificar('COLABORADOR', 'COLABORADOR', YO, OTRO)).toBe(false);
    });

    it('sí dejaría a un colaborador tocar a un usuario, pero es inalcanzable', () => {
      /*
       * Colabrador (1) sobre usuario (0) es estrictamente superior, así que esta
       * función devuelve `true`. No es un agujero: la ruta de administración
       * lleva `rolGuard('ADMIN')`, de modo que un colaborador no llega nunca a
       * pintar la pantalla. La comparación por rangos no sabe de rutas, y por
       * eso las dos comprobaciones viven en capas distintas.
       */
      expect(puedeModificar('COLABORADOR', 'USUARIO', YO, OTRO)).toBe(true);
    });

    it('nunca deja a alguien modificarse a sí mismo', () => {
      // Sin esta regla, un ADMIN se degrada a sí mismo con un clic y se queda
      // sin permisos sin haberlo pedido.
      expect(puedeModificar('ADMIN_SISTEMA', 'ADMIN_SISTEMA', YO, YO)).toBe(false);
      expect(puedeModificar('ADMIN', 'USUARIO', YO, YO)).toBe(false);
    });

    it('no hace nada sin sesión, o sin saber quién eres', () => {
      expect(puedeModificar(null, 'USUARIO', YO, OTRO)).toBe(false);
      expect(puedeModificar('ADMIN_SISTEMA', 'USUARIO', null, OTRO)).toBe(false);
    });
  });

  describe('puedeAsignar', () => {
    it('permite igual o inferior, para que un ADMIN pueda crear otro ADMIN', () => {
      expect(puedeAsignar('ADMIN', 'ADMIN')).toBe(true);
      expect(puedeAsignar('ADMIN', 'COLABORADOR')).toBe(true);
      expect(puedeAsignar('ADMIN', 'USUARIO')).toBe(true);
    });

    it('impide delegar un poder que no se tiene', () => {
      // Si esto pasara, comprometer una cuenta ADMIN bastaría para crear un
      // ADMIN_SISTEMA y tomar el control.
      expect(puedeAsignar('ADMIN', 'ADMIN_SISTEMA')).toBe(false);
      expect(puedeAsignar('COLABORADOR', 'ADMIN')).toBe(false);
      expect(puedeAsignar('USUARIO', 'COLABORADOR')).toBe(false);
    });

    it('no asigna nada sin sesión', () => {
      expect(puedeAsignar(null, 'USUARIO')).toBe(false);
    });
  });
});
