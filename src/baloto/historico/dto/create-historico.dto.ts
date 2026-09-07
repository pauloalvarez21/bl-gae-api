// src/baloto/dto/create-historico.dto.ts
import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHistoricoDto {
  @ApiPropertyOptional({
    description: 'Página del histórico a consultar',
    example: 1,
    default: 1,
    minimum: 1,
    maximum: 125,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(125) // Baloto tiene aproximadamente 125 páginas
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50) // Máximo 50 resultados por página
  limit: number = 10;
}