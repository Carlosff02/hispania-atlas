package com.hispania.services.interfaces;

import com.hispania.presentation.dto.response.PatrimonioCulturalResponse;

import java.util.List;

/**
 * Contrato del servicio unificado de Patrimonio Cultural (HU-22 / Sprint VI).
 *
 * <p>Centraliza la lógica de patrimonio tratando el agregado raíz
 * (lugar con categoría PATRIMONIO + expresiones culturales asociadas)
 * evitando duplicación de código entre el dominio cultural y el patrimonial.
 */
public interface PatrimonioService {

    /**
     * Obtiene el patrimonio cultural agregado de un lugar por su identificador.
     *
     * @param lugarId identificador del lugar
     * @return agregado raíz con el lugar y sus expresiones culturales asociadas, o {@code null} si no existe
     */
    PatrimonioCulturalResponse obtenerPatrimonioPorLugarId(String lugarId);

    /**
     * Lista todos los patrimonios culturales agregados (lugares patrimoniales con sus expresiones).
     *
     * @return lista de agregados de patrimonio cultural
     */
    List<PatrimonioCulturalResponse> listarPatrimonioCompleto();
}
