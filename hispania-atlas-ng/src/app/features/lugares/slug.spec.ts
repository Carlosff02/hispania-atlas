/**
 * src/app/features/lugares/slug.spec.ts
 *
 * El id de un lugar es la clave primaria: si se cuela un guion medio o una
 * tilde, el alta falla con un 400 que habla del id cuando la persona está
 * mirando el campo del nombre. Estas pruebas fijan la traducción de "nombre
 * escrito" a "id válido".
 *
 * Los casos negatives importan tanto como los positivos. El más caro de
 * escribir es el que devuelve cadena vacía: sin él, un nombre de solo signos
 * produciría un id vacío que el backend rechazaría con un mensaje sobre un
 * campo que la persona no tocó.
 */
import { idValido, MAX_ID_LUGAR, sugerirId } from './slug';

describe('sugerirId', () => {
  it('une las palabras con guion bajo y pasa a minúsculas', () => {
    expect(sugerirId('Teatro Solís')).toBe('teatro_solis');
    expect(sugerirId('SACSAYHUAMÁN')).toBe('sacsayhuaman');
  });

  it('quita las tildes antes de decidir qué caracteres valen', () => {
    // Sin quitar el acento, la "í" se contaría como separador y el resultado
    // sería 'teatro_de_sals' en lugar de 'teatro_de_salsa'.
    expect(sugerirId('Salsa de Ñ')).toBe('salsa_de_n');
    expect(sugerirId('El Cóndor de los Andes')).toBe('el_condor_de_los_andes');
  });

  it('colapsa separadores y no deja guiones bajos en los extremos', () => {
    expect(sugerirId('  Museo   del  Oro ')).toBe('museo_del_oro');
    expect(sugerirId('---')).toBe('');
  });

  it('conserva los dígitos, que forman parte del patrón válido', () => {
    expect(sugerirId('Gastronomía 2')).toBe('gastronomia_2');
  });

  it('devuelve vacío cuando el nombre no tiene letras ni números', () => {
    // Ojo con el caso intermediario: "¿Qué tal?" SÍ produce 'que_tal', porque
    // detrás de los signos hay palabras. Solo se queda vacío cuando de verdad no
    // queda nada aprovechable, y el backend también lo contempla con un error
    // legible; aquí la respuesta es la cadena vacía para que el formulario pueda
    // avisar sin enviar un id que el servidor va a rechazar.
    expect(sugerirId('¿¿¿')).toBe('');
    expect(sugerirId('—')).toBe('');
    expect(sugerirId('')).toBe('');
  });

  it('recorta al máximo de la columna en lugar de dejar un id más largo', () => {
    const largo = 'a'.repeat(80);
    expect(sugerirId(largo)).toHaveSize(MAX_ID_LUGAR);
    expect(sugerirId(largo)).toBe('a'.repeat(MAX_ID_LUGAR));
  });
});

describe('idValido', () => {
  it('acepta lo que produce sugerirId', () => {
    expect(idValido(sugerirId('Teatro Solís'))).toBe(true);
    expect(idValido(sugerirId('Gastronomía 2'))).toBe(true);
  });

  it('rechaza lo que el @Pattern de LugarRequest rechazaría', () => {
    expect(idValido('Teatro Solís')).toBe(false); // mayúsculas y tilde
    expect(idValido('teatro-solis')).toBe(false); // guion medio
    expect(idValido('teatro solis')).toBe(false); // espacio
    expect(idValido('a'.repeat(MAX_ID_LUGAR + 1))).toBe(false);
  });

  it('rechaza el id vacío, que es el caso de un nombre sin texto aprovechable', () => {
    expect(idValido('')).toBe(false);
    expect(idValido('   ')).toBe(false);
  });
});
