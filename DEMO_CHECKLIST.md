# Hispania Atlas — Guía de Demostración y Defensa (Sprint VI)

Lista de verificación técnica y flujo guiado de demostración para la evaluación del proyecto final (**HU-24: Cerrar y defender el proyecto** / Criterio 6-2e).

---

## 1. Arquitectura y Componentes del Sistema

- **Backend:** Spring Boot 4.0.8 (Java 25) estructurado en tres capas desacopladas (`presentation`, `services`, `persistence`).
  - Base de datos relacional PostgreSQL con migraciones versionadas Flyway (`V1` a `V9`).
  - Autenticación y autorización basada en JWT con jerarquía estricta de 4 roles (`USUARIO`, `COLABORADOR`, `ADMIN`, `ADMIN_SISTEMA`).
  - Manejo global de excepciones con `GlobalExceptionHandler` y contrato estándar `ApiError`.
  - Agregado raíz `PatrimonioService` consolidando lugares patrimoniales, expresiones culturales y gastronomía tradicional.
- **Frontend:** Angular 20 (TypeScript) con arquitectura reactiva basada en Signals.
  - Vistas: Cartografía interactiva (Leaflet + GeoJSON), Patrimonio Cultural unificado (`/cultura` y `/patrimonios`), Anales Históricos, Economía (Chart.js), Administración de Usuarios y Flujo de Propuestas/Moderación.
  - Interceptors HTTP para inyección de token Bearer y manejo reactivo de errores.
- **Despliegue en la Nube (Azure):**
  - Frontend en **Azure Static Web Apps** (`delightful-dune-03f28690f`).
  - Backend en **Azure App Service (Web App Linux con contenedor)** a partir de la imagen
    `hispania-backend:latest` publicada en **Azure Container Registry** (`hispaniaatlasregistry`).
  - Base de datos en **Azure Database for PostgreSQL Flexible Server** (`hispania-pg`, v17).
  - El procedimiento completo, con las variables de entorno y el diagnóstico de fallos, está
    en el [`README.md`](README.md#despliegue-en-azure).

---

## 2. Lista de Verificación para la Demostración Guiada (Checklist 6-2e)

Siga este orden durante la defensa para evidenciar el cumplimiento de las Historias de Usuario:

### Paso 1: Exploración Cartográfica y Consulta Pública
- [ ] **Mapa interactivo (`/explorar`):** Navegar por los países hispanoamericanos, cambiar las capas temáticas (política, PIB, población, IDH) y seleccionar un país para desplegar el panel lateral con sus indicadores y lugares.
- [ ] **Ubicar desde ficha:** Hacer clic en un lugar para centrar la cámara y abrir el marcador del sitio.

### Paso 2: Sección Unificada de Patrimonio Cultural (`/patrimonios`)
- [ ] **Acceso a la vista unificada:** Ingresar a `/patrimonios` (las rutas anteriores `/cultura` y `/arte` redirigen limpiamente aquí).
- [ ] **Filtros compartidos:** Probar los filtros por categoría (`PATRIMONIO`, `HISTORICO`, `GASTRONOMICO`, `ARTE`, `DANZA`, etc.).
- [ ] **Pestañas de navegación:** Alternar entre *Vista Integral*, *Lugares y Sitios Patrimoniales* y *Tradiciones y Artes*.
- [ ] **Gastronomía tradicional integrada:** Filtrar por `GASTRONOMICO` y observar tanto los sitios gastronómicos como las expresiones de gastronomía tradicional asociadas.
- [ ] **Ubicar en cartografía:** Presionar "Ubicar en Cartografía" sobre un lugar patrimonial y comprobar que redirige al mapa seleccionando el elemento en el store.

### Paso 3: Flujo de Autenticación y Registro (`/cuenta/entrar` y `/cuenta/crear`)
- [ ] **Registro de usuario:** Crear una cuenta nueva de prueba (`USUARIO`).
- [ ] **Inicio de sesión:** Autenticarse exitosamente y verificar la recepción del JWT y la actualización del menú de usuario en la barra superior.

### Paso 4: Propuesta de Contenido por el Usuario (`/propuestas`)
- [ ] **Enviar propuesta:** Completar el formulario de propuesta de un nuevo lugar cultural con sus coordenadas y categoría.
- [ ] **Validaciones de entrada:** Comprobar que campos obligatorios vacíos o coordenadas fuera de rango son rechazados con mensajes claros antes de guardarse.
- [ ] **Estado inicial:** Verificar que la propuesta creada se registra con estado `PENDIENTE` en la lista personal del usuario.

### Paso 5: Moderación y Aprobación (`/propuestas/moderar`)
- [ ] **Control de acceso:** Intentar acceder con rol `USUARIO` a `/propuestas/moderar` y verificar que el sistema redirige a `/sin-permiso` (403 Forbidden).
- [ ] **Sesión de moderador:** Iniciar sesión con una cuenta con rol `COLABORADOR` o superior.
- [ ] **Aprobar propuesta:** Acceder a la cola de moderación, revisar la propuesta pendiente y aprobarla.
- [ ] **Publicación inmediata:** Regresar al mapa o al catálogo de patrimonio y constatar que el nuevo lugar ahora aparece publicado y disponible.

### Paso 6: Verificación de Base de Datos y Logs
- [ ] **Trazabilidad:** Revisar en los logs del servidor los registros generados por SLF4J (`log.info` / `log.warn`) para las operaciones de autenticación, alta de lugares y revisión de propuestas.
- [ ] **Consistencia en BD:** Comprobar la integridad de las tablas `lugares`, `expresiones_culturales` y `propuestas_lugares` en PostgreSQL.

---

## 3. Comandos de Verificación de Calidad

Para ejecutar antes de la presentación:

```bash
# Backend: suite completa de pruebas unitarias
cd hispania-backend-spring
./mvnw test "-Dtest=PatrimonioServiceImplTest,LugarServiceImplTest,PropuestaServiceImplTest,PropuestaExpresionServiceImplTest,AuthServiceImplTest,AdminUsuarioServiceImplTest,ResponseMapperTest,JerarquiaTest,PermisosDeEscrituraTest,LugarControllerTest"

# Frontend: compilación de producción y pruebas
cd ../hispania-atlas-ng
npm run build
npx ng test --watch=false --browsers=ChromeHeadless
```
