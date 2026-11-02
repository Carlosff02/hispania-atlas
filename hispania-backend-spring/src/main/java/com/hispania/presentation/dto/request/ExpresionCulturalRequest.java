package com.hispania.presentation.dto.request;

import com.hispania.persistence.entity.CategoriaExpresion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.groups.Default;

/**
 * Payload de entrada para crear o actualizar una expresión cultural directamente.
 *
 * @param id        slug legible; obligatorio solo en el alta (OnCreate)
 * @param titulo    nombre de la expresión
 * @param categoria disciplina cultural
 * @param country   código ISO de dos letras del país
 * @param descText  descripción detallada
 * @param imagen    nombre de archivo de la imagen (opcional)
 * @param creditos  atribución y licencia (obligatorio si hay imagen)
 */
public record ExpresionCulturalRequest(

        @NotBlank(message = "El id es obligatorio", groups = OnCreate.class)
        @Pattern(regexp = "^[a-z0-9_]+$",
                message = "El id solo admite minusculas, digitos y guion bajo",
                groups = OnCreate.class)
        @Size(max = 100, message = "El id no puede superar los 100 caracteres",
                groups = OnCreate.class)
        String id,

        @NotBlank(message = "El titulo es obligatorio")
        @Size(max = 150, message = "El titulo no puede superar los 150 caracteres")
        String titulo,

        @NotNull(message = "La categoria es obligatoria")
        CategoriaExpresion categoria,

        @NotBlank(message = "El codigo de pais es obligatorio")
        @Size(min = 2, max = 2, message = "El codigo de pais debe tener exactamente 2 caracteres")
        String country,

        @NotBlank(message = "La descripcion es obligatoria")
        @Size(max = 1000, message = "La descripcion no puede superar los 1000 caracteres")
        String descText,

        @Size(max = 500, message = "La URL de imagen no puede superar los 500 caracteres")
        String imagen,

        @Size(max = 300, message = "Los creditos no pueden superar los 300 caracteres")
        String creditos
) {
    public interface OnCreate extends Default {}
    public interface OnUpdate extends Default {}
}
