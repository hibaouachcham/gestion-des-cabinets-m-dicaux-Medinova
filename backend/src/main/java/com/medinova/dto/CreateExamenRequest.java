package com.medinova.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateExamenRequest {
    private Long consultationId;
    private String typeExamen;
    private String description;
    private String instructions;
}