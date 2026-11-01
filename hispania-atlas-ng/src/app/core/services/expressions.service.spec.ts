/**
 * src/app/core/services/expressions.service.spec.ts
 *
 * Lo que se fija aquí es el mapeo del DTO, no el HTTP. La razón por la que este
 * archivo existe es una asimetría: el backend manda la categoría como
 * `string`, y el enum de TypeScript no puede validar nada en la frontera.
 *
 * Con un `as CategoriaExpresion` el compilador callaría y el filtro de la
 * sección agruparía la expresión bajo una etiqueta `undefined`, sin error en
 * ninguna parte. Si el backend añadiera `MUSICA_URBANA` al enum y olvidara
 * actualizar este frontend, la expresión aparecería en la rejilla con un botón
 * en blanco. Por eso la categoría se valida contra la lista cerrada y una
 * expresión con categoría desconocida se descarta en vez de entrar a medias.
 */
import { mapExpresionDTO } from './expressions.service';
import { CATEGORIAS_EXPRESION_ORDEN } from '../models';
import type { ExpresionCulturalDto } from '../models';

function dto(over: Partial<ExpresionCulturalDto> = {}): ExpresionCulturalDto {
  return {
    id: 'el_tango',
    titulo: 'El Tango',
    categoria: 'DANZA',
    paisCode: 'AR',
    paisNombre: 'Argentina',
    descText: 'Genero musical y baile.',
    imagenUrl: '/expresiones/el-tango.jpg',
    creditos: 'Jenny Mealing, CC BY 2.0.',
    ...over,
  };
}

describe('mapeo de expresiones culturales', () => {
  it('mapea los campos que la vista necesita pintar', () => {
    const e = mapExpresionDTO(dto());

    expect(e).not.toBeNull();
    expect(e!.id).toBe('el_tango');
    expect(e!.titulo).toBe('El Tango');
    expect(e!.paisCode).toBe('AR');
    expect(e!.paisNombre).toBe('Argentina');
    expect(e!.desc).toBe('Genero musical y baile.');
    expect(e!.imagenUrl).toBe('/expresiones/el-tango.jpg');
  });

  it('resuelve la etiqueta de la categoría a partir del valor del enum', () => {
    // El store guarda el VALOR ('DANZA') y el botón pinta la ETIQUETA ('Danza').
    // Si se guardara la etiqueta, un cambio de traducción dejaría el filtro
    // apuntando a un valor que ya no existe.
    expect(mapExpresionDTO(dto({ categoria: 'DANZA' }))!.categoria).toBe('DANZA');
    expect(mapExpresionDTO(dto({ categoria: 'DANZA' }))!.categoriaLabel).toBe('Danza');
    expect(mapExpresionDTO(dto({ categoria: 'PINTURA' }))!.categoriaLabel).toBe('Pintura');
  });

  it('descarta una expresión con categoría que el frontend no conoce', () => {
    spyOn(console, 'warn');

    expect(mapExpresionDTO(dto({ categoria: 'MUSICA_URBANA' as never }))).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  it('acepta una expresión sin imagen y conserva sus creditos a null', () => {
    const e = mapExpresionDTO(dto({ imagenUrl: null, creditos: null }));

    expect(e).not.toBeNull();
    expect(e!.imagenUrl).toBeNull();
    expect(e!.creditos).toBeNull();
  });

  it('no pierde el país cuando no hay imagen', () => {
    // El país es el dato que justifica el cambio de tabla: antes era texto suelto y
    // no se podía cruzar. Perderlo al mapear sería volver al problema original.
    const e = mapExpresionDTO(dto({ paisCode: 'PE', paisNombre: 'Perú', imagenUrl: null }));

    expect(e!.paisCode).toBe('PE');
    expect(e!.paisNombre).toBe('Perú');
  });
});

describe('lista de categorías del enum', () => {
  it('está en el mismo orden que el enum del backend', () => {
    // El orden decide el orden de los botones. Si el frontend declara un orden
    // distinto al enum, los botones se muestran en un orden que no corresponde a
    // nada del backend, y no hay nada que lo detecte.
    expect(CATEGORIAS_EXPRESION_ORDEN).toEqual([
      'PINTURA',
      'ESCULTURA',
      'DANZA',
      'MUSICA',
      'TEATRO',
      'LITERATURA',
      'ARTESANIA',
      'TRADICION_ORAL',
      'GASTRONOMIA',
    ]);
  });
});
