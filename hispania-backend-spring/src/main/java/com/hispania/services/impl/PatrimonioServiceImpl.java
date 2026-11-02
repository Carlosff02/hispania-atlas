package com.hispania.services.impl;

import com.hispania.persistence.entity.CategoriaLugar;
import com.hispania.presentation.dto.response.ExpresionCulturalResponse;
import com.hispania.presentation.dto.response.LugarResponse;
import com.hispania.presentation.dto.response.PatrimonioCulturalResponse;
import com.hispania.services.interfaces.ExpresionCulturalService;
import com.hispania.services.interfaces.LugarService;
import com.hispania.services.interfaces.PatrimonioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

/**
 * Implementación del servicio unificado de Patrimonio Cultural (HU-22).
 *
 * <p>El patrimonio cultural actúa como agregado raíz: combina las entidades
 * {@code Lugar} (con categoría PATRIMONIO y afines) y las {@code ExpresionCultural}
 * asociadas a través de sus servicios correspondientes, sin duplicar modelos ni romper
 * los endpoints que ya consume el cliente frontend.
 */
@Service
public class PatrimonioServiceImpl implements PatrimonioService {

    private static final Logger log = LoggerFactory.getLogger(PatrimonioServiceImpl.class);

    private final LugarService lugarService;
    private final ExpresionCulturalService expresionCulturalService;

    public PatrimonioServiceImpl(LugarService lugarService,
                                 ExpresionCulturalService expresionCulturalService) {
        this.lugarService = lugarService;
        this.expresionCulturalService = expresionCulturalService;
    }

    @Override
    @Transactional(readOnly = true)
    public PatrimonioCulturalResponse obtenerPatrimonioPorLugarId(String lugarId) {
        log.debug("Consultando patrimonio unificado para lugar id: {}", lugarId);
        LugarResponse lugar = lugarService.buscarPorId(lugarId);
        if (lugar == null) {
            return null;
        }

        List<ExpresionCulturalResponse> expresiones = expresionCulturalService.listarPorPais(lugar.country());
        if (expresiones == null) {
            expresiones = Collections.emptyList();
        }

        return new PatrimonioCulturalResponse(lugar, expresiones);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatrimonioCulturalResponse> listarPatrimonioCompleto() {
        log.info("Listando catalogo agregado de patrimonio cultural");
        List<LugarResponse> lugaresPatrimoniales = lugarService.listarPorCategoria(CategoriaLugar.PATRIMONIO);

        return lugaresPatrimoniales.stream()
                .map(lugar -> {
                    List<ExpresionCulturalResponse> exp = expresionCulturalService.listarPorPais(lugar.country());
                    return new PatrimonioCulturalResponse(lugar, exp != null ? exp : Collections.emptyList());
                })
                .toList();
    }
}
