// src/baloto/interfaces/response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ResultadoSorteoDto {
  @ApiProperty({ description: 'Número de sorteo', example: 1 })
  sorteo: number;

  @ApiProperty({ description: 'Fecha del sorteo', example: '5 de Septiembre de 2026' })
  fecha: string;

  @ApiProperty({ description: '5 números principales del sorteo', example: [11, 12, 17, 28, 31], type: [Number] })
  numeros: number[];

  @ApiProperty({ description: 'Número superbalota', example: 15 })
  superbalota: number;
}

export class UltimoResultadoResponseDto {
  @ApiProperty({
    description: 'Resultado de Baloto (null si no hay datos)',
    type: () => ResultadoSorteoDto,
    nullable: true,
  })
  baloto: ResultadoSorteoDto | null;

  @ApiProperty({
    description: 'Resultado de Revancha (null si no hay datos)',
    type: () => ResultadoSorteoDto,
    nullable: true,
  })
  revancha: ResultadoSorteoDto | null;
}

export class PaginacionDto {
  @ApiProperty({ description: 'Página actual', example: 1 })
  paginaActual: number;

  @ApiProperty({ description: 'Total de páginas disponibles', example: 125 })
  totalPaginas: number;

  @ApiProperty({ description: 'Resultados por página solicitados', example: 10 })
  resultadosPorPagina: number;
}

export class HistoricoResponseDto {
  @ApiProperty({ description: 'Resultados de Baloto de la página', type: [ResultadoSorteoDto] })
  baloto: ResultadoSorteoDto[];

  @ApiProperty({ description: 'Resultados de Revancha de la página', type: [ResultadoSorteoDto] })
  revancha: ResultadoSorteoDto[];

  @ApiProperty({ description: 'Información de paginación', type: () => PaginacionDto })
  paginacion: PaginacionDto;
}

export class AciertosDto {
  @ApiProperty({ description: 'Cantidad de números acertados (0-5)', example: 3 })
  numeros: number;

  @ApiProperty({ description: 'Si acertó la superbalota', example: true })
  superbalota: boolean;
}

export class VerificacionSorteoDto {
  @ApiProperty({ description: 'Tipo de sorteo verificado', example: 'Baloto' })
  tipoSorteo: string;

  @ApiProperty({ description: 'Si la jugada ganó algún premio', example: true })
  ganador: boolean;

  @ApiProperty({
    description: 'Categoría de premio: Premio Mayor, Segundo Premio, Tercer Premio, Cuarto Premio, Quinto Premio, Sexto Premio, Reintegro o Sin premio',
    example: 'Quinto Premio',
  })
  categoria: string;

  @ApiProperty({ description: 'Nivel de premio (1-7, 0 = sin premio)', example: 5 })
  premio: number;

  @ApiProperty({ description: 'Detalle de aciertos', type: () => AciertosDto })
  aciertos: AciertosDto;

  @ApiProperty({ description: 'Números ganadores del sorteo', example: [11, 12, 17, 28, 31], type: [Number] })
  numerosGanadores: number[];

  @ApiProperty({ description: 'Superbalota ganadora del sorteo', example: 15 })
  superbalotaGanadora: number;
}

export class NumerosUsuarioDto {
  @ApiProperty({ description: 'Números jugados por el usuario', example: [11, 12, 17, 5, 6], type: [Number] })
  numeros: number[];

  @ApiProperty({ description: 'Superbalota jugada por el usuario', example: 15 })
  superbalota: number;
}

export class VerificarResponseDto {
  @ApiProperty({ description: 'Jugada enviada por el usuario', type: () => NumerosUsuarioDto })
  numerosUsuario: NumerosUsuarioDto;

  @ApiProperty({
    description: 'Resultado de la verificación contra Baloto (null si no hay datos)',
    type: () => VerificacionSorteoDto,
    nullable: true,
  })
  baloto: VerificacionSorteoDto | null;

  @ApiProperty({
    description: 'Resultado de la verificación contra Revancha (null si no hay datos)',
    type: () => VerificacionSorteoDto,
    nullable: true,
  })
  revancha: VerificacionSorteoDto | null;

  @ApiProperty({ description: 'Fecha del sorteo verificado', example: '5 de Septiembre de 2026' })
  fecha: string;
}