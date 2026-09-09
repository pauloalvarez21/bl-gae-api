// src/baloto/verificar/dto/create-verificar-por-fecha.dto.ts
import { IsArray, IsNumber, ArrayMinSize, ArrayMaxSize, Min, Max, IsString, Matches } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVerificarPorFechaDto {
  @ApiProperty({
    description: 'Fecha del sorteo a verificar (formato YYYY-MM-DD)',
    example: '2026-09-05',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha: string;

  @ApiProperty({
    description: 'Números principales de la jugada (5 números entre 1 y 43)',
    example: [11, 12, 17, 5, 6],
    type: [Number],
  })
  @Transform(({ value }) => {
    const arr = Array.isArray(value) ? value : String(value).split(',');
    return arr.map((n) => Number(String(n).trim()));
  })
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(43, { each: true })
  numeros: number[];

  @ApiProperty({
    description: 'Número superbalota de la jugada (entre 1 y 16)',
    example: 15,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(16)
  superbalota: number;
}
