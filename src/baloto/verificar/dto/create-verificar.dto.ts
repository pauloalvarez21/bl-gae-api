// src/baloto/dto/create-verificar.dto.ts
import { IsArray, IsNumber, ArrayMinSize, ArrayMaxSize, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVerificarDto {
  @ApiProperty({
    description: 'Números principales de la jugada (5 números entre 1 y 43)',
    example: [11, 12, 17, 5, 6],
    type: [Number],
  })
  @Transform(({ value }) => {
    // Acepta "11,12,17,5,6", ["11","12","17","5","6"] o [11,12,17,5,6]
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