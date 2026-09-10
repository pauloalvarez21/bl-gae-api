// src/baloto/baloto.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { BalotoService } from './baloto.service';
import { CreateVerificarDto } from './verificar/dto/create-verificar.dto';
import { UltimoResultadoResponseDto, HistoricoResponseDto, VerificarResponseDto } from './interfaces/response.dto';

@ApiTags('baloto')
@Controller('baloto')
export class BalotoController {
  constructor(private readonly balotoService: BalotoService) {}

  @Get('ultimo')
  @ApiOperation({ summary: 'Último resultado', description: 'Devuelve el último resultado de Baloto y Revancha' })
  @ApiOkResponse({ description: 'Último resultado de Baloto y Revancha', type: UltimoResultadoResponseDto })
  async obtenerUltimoResultado() {
    return this.balotoService.obtenerUltimoResultado();
  }

  @Get('historico')
  @ApiOperation({ summary: 'Histórico de resultados', description: 'Devuelve los últimos resultados de Baloto y Revancha' })
  @ApiOkResponse({ description: 'Últimos resultados de Baloto y Revancha', type: HistoricoResponseDto })
  async obtenerHistorico() {
    return this.balotoService.obtenerHistorico();
  }

  @Get('verificar')
  @ApiOperation({ summary: 'Verificar jugada', description: 'Verifica una jugada contra el último sorteo y determina si gana premio' })
  @ApiQuery({
    name: 'numeros',
    required: true,
    description: 'Números de la jugada: separados por comas (11,12,17,5,6) o parámetro repetido 5 veces',
    example: '11,12,17,5,6',
  })
  @ApiQuery({ name: 'superbalota', required: true, description: 'Número superbalota (1-16)', example: 15 })
  @ApiOkResponse({ description: 'Resultado de la verificación contra Baloto y Revancha', type: VerificarResponseDto })
  async verificarNumeros(@Query() query: CreateVerificarDto) {
    return this.balotoService.verificarNumeros(query.numeros, query.superbalota);
  }
}