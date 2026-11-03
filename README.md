# Hispania Atlas

Atlas cartográfico y cultural de Hispanoamérica. Proyecto final del **Curso Integrador II**
(Universidad Tecnológica del Perú).

| Capa | Tecnología | Carpeta |
| --- | --- | --- |
| Frontend | Angular 20 (standalone, signals), Tailwind CSS 4, Leaflet, Chart.js | [`hispania-atlas-ng`](hispania-atlas-ng) |
| Backend | Spring Boot 4.0.8, Java 25, Spring Security + JWT, JPA, Flyway | [`hispania-backend-spring`](hispania-backend-spring) |
| Base de datos | PostgreSQL 17 (Azure Database for PostgreSQL Flexible Server) | `hispania-backend-spring/src/main/resources/db/migration` |
| Despliegue | Azure App Service (contenedor Linux) + Azure Container Registry + Azure Static Web Apps | `.github/workflows` |

## Puesta en marcha local

Requisitos: **JDK 25**, **Node.js 20+**, **PostgreSQL 17** (o Testcontainers/Docker para las pruebas).

```bash
# 1. Base de datos
createdb hispania_db

# 2. Backend (http://localhost:8080)
cd hispania-backend-spring
./mvnw spring-boot:run \
  -Dspring-boot.run.arguments="--DB_PASSWORD=postgres --JWT_SECRET=clave-de-desarrollo-de-32-bytes-minimo"

# 3. Frontend (http://localhost:4200)
cd ../hispania-atlas-ng
npm install
npm start
```

El frontend apunta a `http://localhost:8080/api` en desarrollo (`environment.development.ts`)
y a la URL de Azure en producción (`environment.ts`). Si el backend no responde, algunas vistas
caen a los datos de respaldo de `core/data/` y lo avisan en consola.

## Todo en contenedores

```bash
docker compose up --build
```

| Servicio | URL | Nota |
| --- | --- | --- |
| `postgres` | `localhost:5432` | `postgres:17-alpine`, volumen `pgdata`, base `hispania_db` |
| `backend` | `http://localhost:8080` | Espera al `healthcheck` de PostgreSQL |
| `frontend` | `http://localhost:8081` | nginx reenvía `/api` a `backend:8080` |

El frontend del contenedor se compila con la configuración `docker`
(`environment.docker.ts`, `apiBaseUrl: '/api'`), no con la de producción: así el navegador
llama al nginx local y no a Azure.

Si el puerto 5432 ya está ocupado por un PostgreSQL instalado en el equipo, se puede mover
solo el puerto publicado (el backend sigue hablando con `postgres:5432` dentro de la red):

```powershell
$env:POSTGRES_PORT = "5433"
docker compose up --build
```

También se pueden cambiar `BACKEND_PORT` y `FRONTEND_PORT`. El compose declara
`name: hispania`, de modo que no colisiona con otros proyectos de Docker Compose que tengan
la misma carpeta (`01 Proyecto Final`).

## Pruebas

```bash
# Backend: 150 pruebas (unitarias + controladores + Testcontainers)
cd hispania-backend-spring && ./mvnw test

# Frontend: 41 pruebas con Karma
cd hispania-atlas-ng
npm run build          # compilación de producción
npm test -- --watch=false --browsers=ChromeHeadless
```

En Windows, si Karma no encuentra Chrome, se puede reutilizar Edge:

```powershell
$env:CHROME_BIN = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npm test -- --watch=false
```

## Despliegue en Azure

### Recursos

| Recurso | Nombre | Configuración |
| --- | --- | --- |
| Grupo de recursos | `RG_HispaniaAtlas` | — |
| Azure Container Registry | `hispaniaatlasregistry` | SKU Basic (suficiente para el curso) |
| App Service Plan | plan del grupo | **Free F1** (1 vCPU, 1 GB) |
| Web App (backend) | `hispania-backend` | Linux, imagen de contenedor, puerto **8080** |
| PostgreSQL Flexible Server | `hispania-pg` | v17, Canada Central, tier gratuito, solo autenticación PostgreSQL |
| Static Web App (frontend) | `delightful-dune-03f28690f` | `https://delightful-dune-03f28690f.4.azurestaticapps.net` |

### 1. Backend: imagen en ACR

La imagen se construye con el `Dockerfile` de `hispania-backend-spring` (build multi-stage:
JDK 25 → JRE 25 Alpine, usuario sin privilegios, `PORT=8080`).

```bash
# Opción A — Docker local
docker build -t hispaniaatlasregistry.azurecr.io/hispania-backend:latest ./hispania-backend-spring
docker login hispaniaatlasregistry.azurecr.io
docker push hispaniaatlasregistry.azurecr.io/hispania-backend:latest

# Opción B — sin Docker local (sube el contexto a ACR y construye allí)
az acr build --registry hispaniaatlasregistry \
  --image hispania-backend:latest ./hispania-backend-spring
```

También existe la opción de publicar desde GitHub Actions (`.github/workflows/main.yml`), que
construye, sube la imagen y actualiza la Web App. Requiere los secretos `AZURE_CLIENT_ID`,
`AZURE_TENANT_ID` y `AZURE_SUBSCRIPTION_ID` y un *push* a `main`.

### 2. Backend: Web App

En **App Service → hispania-backend → Configuración**:

- **Origen de la imagen:** Azure Container Registry `hispaniaatlasregistry`,
  imagen `hispania-backend`, etiqueta `latest`.
- **Puerto:** `8080` (variable `WEBSITES_PORT=8080`).
- **Identidad administrada:** activarla y asignarle el rol **AcrPull** sobre el registro
  (así la Web App descarga la imagen sin guardar contraseñas).
- **Siempre disponible:** desactivado en el plan Free (no existe la opción).

**App settings obligatorios** (sin ellos la aplicación no arranca, por diseño):

| Variable | Ejemplo / nota |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://hispania-pg.postgres.database.azure.com:5432/hispania_db?sslmode=require` |
| `DB_USER` | `hispania_admin` |
| `DB_PASSWORD` | contraseña del servidor PostgreSQL |
| `JWT_SECRET` | cadena aleatoria de **32 bytes o más** |
| `CORS_ALLOWED_ORIGINS` | `https://delightful-dune-03f28690f.4.azurestaticapps.net` |
| `ADMIN_USERNAME` | opcional: crea el primer `ADMIN_SISTEMA` si no existe ninguno |
| `ADMIN_EMAIL` | ídem |
| `ADMIN_PASSWORD` | ídem |
| `WEBSITES_PORT` | `8080` |

`JWT_SECRET` no tiene valor por defecto y `DB_PASSWORD` tampoco: si faltan, Spring aborta el
arranque en lugar de usar una credencial de ejemplo.

### 3. Migraciones

Flyway se ejecuta al arrancar el contenedor (`spring.flyway.enabled=true`). Las nueve
migraciones `V1` … `V9` crean el esquema, los índices, las restricciones y los datos
semilla. Hibernate solo valida (`ddl-auto=validate`): si una entidad no coincide con la
tabla, el arranque falla en vez de modificar el esquema.

Para aplicarlas manualmente contra el servidor de Azure:

```bash
cd hispania-backend-spring
./mvnw flyway:migrate \
  -Dflyway.url="jdbc:postgresql://hispania-pg.postgres.database.azure.com:5432/hispania_db?sslmode=require" \
  -Dflyway.user=hispania_admin \
  -Dflyway.password="<contraseña>"
```

### 4. Frontend

```bash
cd hispania-atlas-ng
npm ci
npm run build          # dist/hispania-atlas-ng/browser
```

El contenido de `dist/hispania-atlas-ng/browser` se publica en la Static Web App. Hay tres
caminos, de menos a más automatizado:

```powershell
# A. CLI de Static Web Apps (token en el portal: Static Web App → Administrar token de implementación)
npx @azure/static-web-apps-cli deploy ./dist/hispania-atlas-ng/browser `
  --deployment-token "<TOKEN>" --env production

# B. GitHub Actions: el workflow azure-static-web-apps-delightful-dune-03f28690f.yml
#    publica en cada push a main y ya tiene el token configurado como secreto.

# C. Extensión de Azure para VS Code: "Deploy Static Web App".
```

Antes de compilar hay que confirmar que `src/environments/environment.ts` apunta al hostname
real de la Web App:

```ts
apiBaseUrl: 'https://hispania-backend-exe4cyeahhg8c2de.westus3-01.azurewebsites.net/api',
```

### 5. Prueba de humo posterior al despliegue

1. `GET /api/countries` devuelve la lista de países.
2. `GET /api/places` y `GET /api/expresiones` devuelven datos; el catálogo los muestra con
   etiquetas legibles.
3. Registro e inicio de sesión: se recibe el JWT y la cabecera muestra usuario y rol.
4. Con `COLABORADOR`: crear, editar y eliminar un lugar.
5. Con `USUARIO`: enviar una propuesta. Con `COLABORADOR`: aprobarla y comprobar que aparece
   en el atlas.
6. Las imágenes de `/expresiones/**` cargan y no hay errores de CORS en la consola.

La lista completa, con el flujo de defensa, está en [`DEMO_CHECKLIST.md`](DEMO_CHECKLIST.md).

### Diagnóstico rápido

| Síntoma | Causa habitual |
| --- | --- |
| La Web App muestra «Application Error» o no arranca | La imagen `hispania-backend:latest` no está publicada en ACR, o falta `DB_PASSWORD` / `JWT_SECRET`. |
| `401` en todas las llamadas | El frontend apunta a otro hostname, o `JWT_SECRET` cambió después de emitir los tokens. |
| Error de CORS en el navegador | Falta el dominio del frontend en `CORS_ALLOWED_ORIGINS`. |
| `502` tras el despliegue | El contenedor escucha en otro puerto; revisar `WEBSITES_PORT=8080` y `PORT`. |
| Flyway falla al arrancar | Migración aplicada fuera de orden o `flyway_schema_history` inconsistente; revisar los logs de App Service. |

## Documentación del proyecto

- [`DEMO_CHECKLIST.md`](DEMO_CHECKLIST.md) — guía de demostración y defensa (Sprint VI).
- `3.1.11. Pruebas de Usabilidad - Heurística de Nielsen.docx` — evaluación heurística,
  pruebas de escalabilidad, confiabilidad, seguridad e integración.
- `3.1.11. Arquitectura de Aplicaciones.docx` — arquitectura por capas y decisiones de diseño.
