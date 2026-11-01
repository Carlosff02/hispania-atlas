/**
 * Tabla de rutas. Equivalente directo del bloque `<Routes>` de `App.tsx`:
 * cada `Route path=... element=...` se vuelve un objeto con `path` y
 * `component` dentro de un array exportado.
 *
 * Diferencias menores respecto a React:
 *  - `redirectTo` reemplaza `<Navigate to="..." replace />`.
 *  - El comodín se escribe `**` y NO lleva `pathMatch` (mismo comportamiento).
 *  - No hay que importar los componentes de forma diferida aquí: Angular ya
 *    genera un bundle por ruta de forma nativa con el compilador AOT.
 */
import type { Routes } from '@angular/router';

import { Login } from './features/auth/login';
import { Registro } from './features/auth/registro';
import { SinPermiso } from './features/auth/sin-permiso';
import { Usuarios } from './features/admin/usuarios';
import { ArteGrid } from './features/arte/arte-grid';
import { Cultura } from './features/cultura/cultura';
import { Datos } from './features/datos/datos';
import { Milestones } from './features/hitos/milestones';
import { ExplorarView } from './features/map/explorar-view';
import { Lugares } from './features/lugares/lugares';
import { Moderar } from './features/propuestas/moderar';
import { Propuestas } from './features/propuestas/propuestas';
import { autenticadoGuard, rolGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'explorar' },
  { path: 'explorar', component: ExplorarView },
  { path: 'arte', component: ArteGrid },
  { path: 'hitos', component: Milestones },
  { path: 'cultura', component: Cultura },
  { path: 'datos', component: Datos },

  /* Sesión. Son las únicas rutas de cuenta y las dos son públicas: si ya hay
     sesión, Login redirige solo, así que no hace falta una guarda de "no
     visitable si ya entraste". */
  { path: 'cuenta/entrar', component: Login },
  { path: 'cuenta/crear', component: Registro },
  { path: 'sin-permiso', component: SinPermiso },

  /* Propuestas. Cualquiera con sesión puede proponer, así que esta vista solo
     exige estar autenticado. La moderación lleva `rolGuard` y va en ruta aparte
     porque la ve otra persona y no tiene sentido mezclarla con el propio envío. */
  { path: 'propuestas', component: Propuestas, canActivate: [autenticadoGuard] },
  {
    path: 'propuestas/moderar',
    component: Moderar,
    canActivate: [rolGuard('COLABORADOR')],
  },

  /* Administración. Con `rolGuard('ADMIN')`: si un colaborador apunta aquí,
     aterriza en /sin-permiso, que explica el 403 en vez de soltar un error seco. */
  { path: 'admin/usuarios', component: Usuarios, canActivate: [rolGuard('ADMIN')] },

  /* Gestión directa de lugares. El mínimo es COLABORADOR, que es lo que exige
     `POST /api/places` y `PUT /api/places/{id}`; borrar está en la misma pantalla
     pero solo para ADMIN+, igual que en el backend. Un USUARIO que abra la ruta
     a mano aterriza en /sin-permiso en vez de ver un formulario que el servidor
     iba a rechazar. */
  { path: 'lugares', component: Lugares, canActivate: [rolGuard('COLABORADOR')] },

  {
    path: 'cuenta',
    canActivate: [autenticadoGuard],
    loadComponent: () => import('./features/auth/perfil').then((m) => m.Perfil),
  },

  { path: '**', redirectTo: 'explorar' },
];
