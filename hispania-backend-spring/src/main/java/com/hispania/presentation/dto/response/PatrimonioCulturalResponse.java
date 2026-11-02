package com.hispania.presentation.dto.response;

import java.util.List;

/**
 * Agregado raíz de Patrimonio Cultural (HU-22 / RFC-001).
 *
 * <p>Reúne un lugar cultural/patrimonial con las expresiones culturales asociadas
 * a su territorio o contexto, tratando el patrimonio como una sola unidad
 * conceptual sin duplicar código ni romper los contratos individuales de la API.
 *
 * @param lugar                datos del lugar o monumento patrimonial
 * @param expresionesAsociadas expresiones culturales asociadas (tradiciones, artes, gastronomía)
 */
public record PatrimonioCulturalResponse(
        LugarResponse lugar,
        List<ExpresionCulturalResponse> expresionesAsociadas
) {
}
