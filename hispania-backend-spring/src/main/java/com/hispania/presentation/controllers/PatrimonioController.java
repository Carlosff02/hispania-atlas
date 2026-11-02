package com.hispania.presentation.controllers;

import com.hispania.presentation.dto.response.PatrimonioCulturalResponse;
import com.hispania.services.interfaces.PatrimonioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Endpoints del agregado raíz de Patrimonio Cultural (HU-22 / RFC-001).
 *
 * <p>Expone el agregado unificado en {@code /api/patrimonios} sin alterar ni
 * romper los endpoints existentes {@code /api/places} ni {@code /api/expresiones}.
 */
@RestController
@RequestMapping("/api/patrimonios")
public class PatrimonioController {

    private static final Logger log = LoggerFactory.getLogger(PatrimonioController.class);

    private final PatrimonioService patrimonioService;

    public PatrimonioController(PatrimonioService patrimonioService) {
        this.patrimonioService = patrimonioService;
    }

    /**
     * {@code GET /api/patrimonios} -> Lista todos los patrimonios culturales agregados.
     */
    @GetMapping
    public List<PatrimonioCulturalResponse> listar() {
        log.info("GET /api/patrimonios - consultando catalogo unificado");
        return patrimonioService.listarPatrimonioCompleto();
    }

    /**
     * {@code GET /api/patrimonios/{lugarId}} -> Devuelve el agregado o 404.
     */
    @GetMapping("/{lugarId}")
    public ResponseEntity<PatrimonioCulturalResponse> buscarPorLugar(@PathVariable String lugarId) {
        log.info("GET /api/patrimonios/{} - consultando agregado", lugarId);
        PatrimonioCulturalResponse response = patrimonioService.obtenerPatrimonioPorLugarId(lugarId);
        return response == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(response);
    }
}
