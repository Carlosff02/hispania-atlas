/**
 * Entorno de CONTENEDOR LOCAL (`docker compose up`).
 *
 * El frontend se sirve con nginx en el puerto 8081 y nginx reenvía `/api` al
 * contenedor `backend:8080`. Por eso la URL es relativa: si se dejara la de
 * producción, el navegador llamaría a Azure y el backend local no se usaría.
 */
export const environment = {
  production: true,
  apiBaseUrl: '/api',
  cartoApiKey: 'cb1_2kvj_1_b8e44108840aea76999ee2a6',
};
