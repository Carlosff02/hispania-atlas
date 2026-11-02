package com.hispania.services.impl;

import com.hispania.persistence.entity.CategoriaLugar;
import com.hispania.presentation.dto.response.ExpresionCulturalResponse;
import com.hispania.presentation.dto.response.LugarResponse;
import com.hispania.presentation.dto.response.PatrimonioCulturalResponse;
import com.hispania.services.interfaces.ExpresionCulturalService;
import com.hispania.services.interfaces.LugarService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Servicio unificado de Patrimonio Cultural")
class PatrimonioServiceImplTest {

    @Mock
    private LugarService lugarService;

    @Mock
    private ExpresionCulturalService expresionCulturalService;

    @InjectMocks
    private PatrimonioServiceImpl patrimonioService;

    private static LugarResponse lugar(String id, String category) {
        return new LugarResponse(id, "Lugar " + id, "PE", -12.0, -77.0, category, "landmark", "1500", "Desc", null);
    }

    private static ExpresionCulturalResponse expresion(String id, String cat) {
        return new ExpresionCulturalResponse(id, "Expresion " + id, cat, "PE", "Perú", "Desc cultural", null, null);
    }

    @Test
    @DisplayName("obtenerPatrimonioPorLugarId reúne el lugar con sus expresiones asociadas sin duplicar datos")
    void obtenerPatrimonioPorLugarIdExitoso() {
        when(lugarService.buscarPorId("machu")).thenReturn(lugar("machu", "PATRIMONIO"));
        when(expresionCulturalService.listarPorPais("PE")).thenReturn(List.of(expresion("marinera", "DANZA")));

        PatrimonioCulturalResponse resp = patrimonioService.obtenerPatrimonioPorLugarId("machu");

        assertThat(resp).isNotNull();
        assertThat(resp.lugar().id()).isEqualTo("machu");
        assertThat(resp.expresionesAsociadas()).hasSize(1);
        assertThat(resp.expresionesAsociadas().get(0).id()).isEqualTo("marinera");
        verify(lugarService).buscarPorId("machu");
        verify(expresionCulturalService).listarPorPais("PE");
    }

    @Test
    @DisplayName("obtenerPatrimonioPorLugarId devuelve null si el lugar no existe")
    void obtenerPatrimonioPorLugarIdInexistente() {
        when(lugarService.buscarPorId("inexistente")).thenReturn(null);

        PatrimonioCulturalResponse resp = patrimonioService.obtenerPatrimonioPorLugarId("inexistente");

        assertThat(resp).isNull();
    }

    @Test
    @DisplayName("listarPatrimonioCompleto agrupa lugares patrimoniales con expresiones")
    void listarPatrimonioCompletoAgrupaLugares() {
        when(lugarService.listarPorCategoria(CategoriaLugar.PATRIMONIO)).thenReturn(List.of(lugar("machu", "PATRIMONIO")));
        when(expresionCulturalService.listarPorPais("PE")).thenReturn(List.of(expresion("marinera", "DANZA")));

        List<PatrimonioCulturalResponse> lista = patrimonioService.listarPatrimonioCompleto();

        assertThat(lista).hasSize(1);
        assertThat(lista.get(0).lugar().id()).isEqualTo("machu");
        assertThat(lista.get(0).expresionesAsociadas()).hasSize(1);
    }
}
