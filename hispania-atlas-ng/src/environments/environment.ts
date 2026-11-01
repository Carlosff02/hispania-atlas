/**
 * Entorno de PRODUCCIÓN (build por defecto).
 *
 * En producción la app se sirve desde el mismo origen que el backend, así que
 * usamos rutas relativas y evitamos por completo el problema de CORS.
 * Si sirves el frontend en otro dominio, cambia `apiBaseUrl` por la URL
 * absoluta del backend.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://hispania-atlas-backend.onrender.com/api',
  cartoApiKey: 'cb1_2kvj_1_b8e44108840aea76999ee2a6',
};
