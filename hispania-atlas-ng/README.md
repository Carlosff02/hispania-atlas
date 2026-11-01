# Hispania Atlas — Angular

Migración de [`hispania-atlas`](../hispania-atlas) (React 19 + Vite) a **Angular 20**, con las mismas
cinco vistas, el mismo diseño y las mismas integraciones:

- **Leaflet** + coroplética de países (Natural Earth GeoJSON)
- **Chart.js** para la comparativa macroeconómica
- **Tailwind CSS 4** con el mismo tema (colores `paper`/`ink`/`brass`/`vicblue`, tipografías)
- **Spring Boot** como backend, con datos de respaldo locales si no está disponible

## Puesta en marcha

```bash
npm install

# Terminal 1 — backend (hermano, en ../patrimonio-backend o ../hispania-backend)
# Terminal 2 — frontend
npm start            # http://localhost:4200
```

Si el backend no está levantado, la app funciona igual: los services caen a los datos
de respaldo de `core/data/`. En consola verás el aviso correspondiente.

| Comando | Qué hace |
| --- | --- |
| `npm start` | Dev server con HMR en el puerto 4200 |
| `npm run build` | Build de producción en `dist/hispania-atlas-ng/` |
| `npm run lint` | ESLint (`angular-eslint` + `typescript-eslint`) |
| `npm test` | Tests unitarios con Karma |

## Backend y CORS

`ng serve` corre en el 4200 y Spring Boot en el 8080, así que **no hay CORS**: el dev server
reenvía las peticiones de `/api` al backend gracias a `proxy.conf.json`.

| Entorno | `apiBaseUrl` | Resultado |
| --- | --- | --- |
| `environment.development.ts` | `/api` | Pasa por el proxy, mismo origen |
| `environment.ts` (producción) | `/api` | Se sirve desde el mismo origen que el backend |

Si prefieres llamar al backend por su URL absoluta (como hace la versión React con
`http://localhost:8080/api`), cambia `apiBaseUrl` en `environment.development.ts` y
asegúrate de tener CORS habilitado en Spring Boot.

La clave de CARTO para las teselas del mapa está en `environment.development.ts`
(`cartoApiKey`). En producción queda vacía a propósito: es una clave de desarrollo y
debe inyectarse en el despliegue, no subirse al repositorio.

## Estructura

```
src/
├── environments/          URLs y claves por entorno (fileReplacements en angular.json)
└── app/
    ├── app.ts / .html     Shell: header + <router-outlet>
    ├── app.routes.ts      Tabla de rutas
    └── core/              Singleton, sin dependencias de la UI
        ├── models/        Tipos del dominio + DTOs del backend
        ├── data/          Datos estáticos y de respaldo
        ├── services/      HTTP con HttpClient + RxJS
        └── state/         AppStore (signals) — estado global
    ├── shared/            Reutilizable por varias features
    │   ├── chart/         Envoltura de Chart.js
    │   └── layout/        Header, SearchBox
    └── features/          Una carpeta por vista (lazy-load candidate)
        ├── map/           ExplorarView, MapView, CountryPanel, PlaceCard
        ├── arte/          ArteGrid
        ├── hitos/         Milestones
        ├── cultura/       Cultura
        ├── datos/         Datos
        ├── auth/          Login, Registro, Perfil, SinPermiso
        ├── propuestas/    Propuestas (enviar y propias), Moderar
        ├── lugares/       Lugares (CRUD directo), slug
        └── admin/         Usuarios
```

Rutas públicas: `/explorar` (la raíz redirige aquí) · `/arte` · `/hitos` · `/cultura` ·
`/datos` · `/cuenta/entrar` · `/cuenta/crear` · `/sin-permiso`.

Rutas con sesión, con la guarda que cada una necesita:

| Ruta                      | Guarda                | Qué hace                                            |
| ------------------------- | --------------------- | --------------------------------------------------- |
| `/cuenta`                 | `autenticadoGuard`    | Perfil de la cuenta                                  |
| `/propuestas`             | `autenticadoGuard`    | Enviar una propuesta y ver las propias               |
| `/lugares`                | `rolGuard('COLABORADOR')` | Crear, editar y eliminar lugares                 |
| `/propuestas/moderar`     | `rolGuard('COLABORADOR')` | Aprobar o rechazar propuestas                    |
| `/admin/usuarios`         | `rolGuard('ADMIN')`    | Cambiar roles y activar o desactivar cuentas          |

Cualquier ruta desconocida redirige a `/explorar`.

Dos reglas que explican por qué `/lugares` empieza en `COLABORADOR` y por qué el
botón de eliminar desaparece para ese rol: replican los `@PreAuthorize` de
`LugarController` (`COLABORADOR` para crear y actualizar, `ADMIN` para borrar).
La interfaz no decide la seguridad, solo evita pintar botones que el servidor iba
a rechazar. Lo que sí decide es cuándo pedir confirmación: el borrado no tiene
vuelta atrás porque no hay baja lógica, y por eso exige un segundo clic.

## Guía de equivalencias React → Angular

Lo que más cambia no es la sintaxis de plantilla, sino **dónde vive el estado** y
**cuándo se ejecuta el código**.

### Estado

| React | Angular |
| --- | --- |
| `useState` | `signal()` |
| `useMemo(fn, deps)` | `computed()` — sin lista de dependencias, Angular la deduce |
| `useEffect` con deps | `effect(() => ...)` en el constructor |
| `useEffect` de montaje | `afterNextRender()` |
| Limpieza del `useEffect` | `ngOnDestroy()` |
| `useRef` (elemento) | `viewChild()` / `inject(ElementRef)` |
| `useContext` + `useReducer` | `inject(AppStore)` con signals de solo lectura |
| `dispatch({ type, payload })` | Un método por acción: `store.selectCountry(p)` |
| `useNavigate()` | `inject(Router).navigateByUrl()` |

Dos diferencias que conviene tener presentes:

1. **`computed` no necesita array de dependencias.** En React era fácil olvidar uno y
   cachear un valor obsoleto; aquí las dependencias se leen del código.
2. **No hay `useMemo` para índices.** El proyecto React definía `buildByCode()` tres
   veces (en MapView, Cultura y Milestones) para resolver país-por-código. Ahora está
   una vez como `computed` en el store, y `placesByCountry()` agrupa los lugares.

### Plantilla

| React (JSX) | Angular |
| --- | --- |
| `{cond && <X/>}` | `@if (cond) { <x-cmp /> }` |
| `{arr.map(x => <X/>)}` | `@for (x of arr; track x.id) { <x-cmp /> }` |
| `className={({isActive}) => ...}` | `[ngClass]="miClase(path)"` calculada desde el router |
| `<NavLink to=... >` | `[routerLink]` (el estado activo se calcula a mano, ver abajo) |
| `onClick={() => f(x)}` | `(click)="f(x)"` |
| `useState` en input controlado | `[value]="q()" + (input)="onInput($event)"` |
| `onChange` de un input | `(input)` — en Angular `change` solo dispara al perder el foco |
| `return null` en un componente | `@if (...) { ... }` en la plantilla |

> **Por qué no se usa `routerLinkActive`:** esa directiva *agrega* clases encima de las
> existentes, y como `text-paper-dark` y `text-brass-light` son dos utilidades del mismo
> grupo de Tailwind (misma especificidad), siempre ganaría la que saliera última en el
> CSS generado. Devolviendo la lista completa con `[ngClass]` nunca hay dos clases de
> color compitiendo.

### Servicios y datos

`fetch()` + `async/await` se reemplaza por `HttpClient` con Observables:

| React | Angular |
| --- | --- |
| `fetch(url).then(r => r.json())` | `http.get<T>(url)` |
| `try { … } catch { return fallback }` | `catchError(() => of(fallback))` |
| `await service.dato()` | `firstValueFrom(service.dato$)` |

`CountriesService.countries$` y `PlacesService.places$` llevan `shareReplay({ bufferSize: 1 })`:
varios componentes que se suscriban a la vez hacen **una sola** petición, en lugar de una
por suscriptor.

### Lo que NO se migró (porque en React tampoco se usaba)

El `AppContext` de React definía varias acciones que ningún componente despachaba. Como
no cambian ningún comportamiento, no se replicaron; el detalle está comentado al final de
`core/state/app.store.ts`:

- `SET_VIEW` → lo cubre el `Router`
- `SET_MILE_FILTER` / `SET_CULT_FILTER` → esas vistas usan estado local
- `TOGGLE_DATA_COUNTRY` → la vista Datos mantiene su propia selección

`layerId` sí se conservó, porque tiene su propio tipo (`LayerId` / `CapaMapa`) y sirve de
bandera para el selector de capas del mapa.

Tampoco se migró `hooks/usePlaces.ts`: en el proyecto React era código muerto (ningún
componente lo importaba). Su función la cubren `PlacesService.places$` y los signals
`loading` / `loadError` del store.

## Limitación conocida

En la vista **Economía**, cambiar el indicador a "Población" o "IDH" actualiza las
tarjetas numéricas, pero **la línea del gráfico sigue mostrando el PBI**. La causa es el
modelo de datos, no Angular ni Chart.js: `SeriePunto` solo tiene `{ year, gdp }`, así que
es el único valor con serie histórica. Para arreglarlo hay que pedir al backend la serie
de cada métrica y extender `SeriePunto`.

## Detalle menor corregido

`places.ts` traía el Teatro Colón con `category: 'Danza'` (minúscula inicial) mientras que
el enum `CategoriaLugar` y el filtro de la vista Cultura usan `'DANZA'`. En React eso
compilaba porque el archivo declaraba su propia interfaz con `category: string`, pero hacía
que el Teatro Colón nunca apareciera al filtrar por DANZA. Aquí es `'DANZA'`.
