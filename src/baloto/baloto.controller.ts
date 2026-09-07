// src/baloto/baloto.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { BalotoService } from './baloto.service';
import { CreateVerificarDto } from './verificar/dto/create-verificar.dto';
import { CreateHistoricoDto } from './historico/dto/create-historico.dto';
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
  @ApiOperation({ summary: 'Histórico de resultados', description: 'Devuelve resultados históricos paginados de Baloto y Revancha' })
  @ApiQuery({ name: 'page', required: false, description: 'Página del histórico a consultar (1-125)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de resultados por página (1-50)', example: 10 })
  @ApiOkResponse({ description: 'Resultados históricos paginados', type: HistoricoResponseDto })
  async obtenerHistorico(@Query() query: CreateHistoricoDto) {
    return this.balotoService.obtenerHistorico(query.page, query.limit);
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