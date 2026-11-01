/**
 * src/app/features/lugares/slug.ts
 *
 * Propuesta de identificador para el alta directa de un lugar.
 *
 * Al proponer un lugar el backend genera el id solo (ver `slug()` en
 * `PropuestaServiceImpl`), pero al crearlo por la vía directa lo elige el cliente:
 * `LugarRequest.id` es obligatorio en el alta y solo admite
 * `^[a-z0-9_]+$`. Escribir ese patrón a mano es una forma fácil de comerse un 400
 * con un mensaje sobre el id justo cuando el usuario cree que está guardando el
 * nombre, así que esta función hace la parte mechanical.
 *
 * Está aislada en su propio archivo, sin Angular, por dos razones: se puede
 * probar como función pura (`slug.spec.ts`) y la regla queda visible al lado de
 * la pantalla que la usa.
 *
 * NO decide el contenido final. El id que se acaba guardando es el que el
 * backend acepte, y un id repetido produce un 409 que la pantalla muestra tal
 * cual. Aquí no se comprueba nada contra la base de datos porque no se puede
 * desde el navegador sin una llamada extra por cada tecla.
 */

/** `lugares.id` es una columna de 50 caracteres en PostgreSQL. */
export const MAX_ID_LUGAR = 50;

/**
 * Normaliza un nombre a minúsculas sin tildes, con las palabras unidas por guion
 * bajo: el mismo criterio que aplica el backend, para que lo que sugiere esta
 * pantalla sea lo que generaría una propuesta con ese mismo nombre.
 *
 * Devuelve cadena vacía cuando el nombre no tiene ni letras ni números
 * ("¿Qué tal?"). No es un caso inventado: el backend también lo contempla y
 * lanza un error legible, y devolver `''` permite que el formulario diga "este
 * nombre no sirve para generar un id" en vez de mandar un id vacío y comerse un
 * 400.
 *
 * @param nombre nombre del lugar tal como lo escribió la persona
 */
export function sugerirId(nombre: string): string {
  const sinAcentos = nombre
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();

  const slug = sinAcentos.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

  return slug.slice(0, MAX_ID_LUGAR);
}

/**
 * ¿Lo que devuelve `sugerirId` es aceptable por el backend?
 *
 * Se separa del propio `sugerirId` porque la respuesta a esa pregunta no siempre
 * es la misma: "Catedral de Santiago" sí, y un id escrito a mano con un guion
 * medio tampoco. La regla es la del `@Pattern` de `LugarRequest`, replicada para
 * poder avisar antes de enviar.
 */
export function idValido(id: string): boolean {
  return id.length > 0 && id.length <= MAX_ID_LUGAR && /^[a-z0-9_]+$/.test(id);
}
