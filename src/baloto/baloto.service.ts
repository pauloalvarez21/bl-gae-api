// src/baloto/baloto.service.ts
import { Injectable, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ResultadoBaloto, ResultadoRevancha } from './interfaces/resultado.interface';

@Injectable()
export class BalotoService {
  private readonly logger = new Logger(BalotoService.name);
  private readonly CACHE_KEY = 'baloto_resultados_ultimos';

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async obtenerUltimosResultados(): Promise<{ baloto: ResultadoBaloto[]; revancha: ResultadoRevancha[] }> {
    const cachedData = await this.cacheManager.get<{ baloto: ResultadoBaloto[]; revancha: ResultadoRevancha[] }>(this.CACHE_KEY);

    if (cachedData) {
      this.logger.log('⚡ Sirviendo datos desde CACHÉ');
      return cachedData;
    }

    this.logger.log('🕷️ Extrayendo datos con axios + cheerio...');
    
    try {
      const { data: html } = await axios.get('https://www.baloto.com/resultados', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(html);
      const balotoResultados: ResultadoBaloto[] = [];
      const revanchaResultados: ResultadoRevancha[] = [];

      $('table tbody tr').each((index, element) => {
        const celdas = $(element).find('td');
        if (celdas.length >= 3) {
          const sorteoTexto = $(celdas[0]).text().trim();
          const fecha = $(celdas[1]).text().trim();
          const numerosTexto = $(celdas[2]).text().trim();

          const partes = numerosTexto.split('-').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
          
          if (partes.length >= 6) {
            const resultado = {
              sorteo: parseInt(sorteoTexto) || index + 1,
              fecha,
              numeros: partes.slice(0, 5),
              superbalota: partes[5],
            };

            if (index % 2 === 0) {
              balotoResultados.push(resultado);
            } else {
              revanchaResultados.push(resultado);
            }
          }
        }
      });

      const datosFinales = {
        baloto: balotoResultados,
        revancha: revanchaResultados,
      };

      await this.cacheManager.set(this.CACHE_KEY, datosFinales, 3600);
      this.logger.log('✅ Datos extraídos y guardados en caché');

      return datosFinales;

    } catch (error: any) {
      this.logger.error('Error al extraer datos:', error.message);
      this.logger.error('Stack:', error.stack);
      throw new HttpException(
        `Error al obtener datos de Baloto: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async obtenerUltimoResultado(): Promise<{ baloto: ResultadoBaloto | null; revancha: ResultadoRevancha | null }> {
    const resultados = await this.obtenerUltimosResultados();
    return {
      baloto: resultados.baloto[0] || null,
      revancha: resultados.revancha[0] || null,
    };
  }

  async verificarNumeros(numeros: number[], superbalota: number) {
    const resultados = await this.obtenerUltimoResultado();
    
    const verificarSorteo = (numerosUsuario: number[], superbalotaUsuario: number, numerosGanadores: number[], superbalotaGanadora: number, tipoSorteo: string) => {
      const aciertosNumeros = numerosUsuario.filter(n => numerosGanadores.includes(n)).length;
      const aciertoSuperbalota = superbalotaUsuario === superbalotaGanadora;
      
      let categoria = 'Sin premio';
      let premio = 0;
      
      if (aciertosNumeros === 5 && aciertoSuperbalota) { categoria = 'Premio Mayor'; premio = 1; }
      else if (aciertosNumeros === 5) { categoria = 'Segundo Premio'; premio = 2; }
      else if (aciertosNumeros === 4 && aciertoSuperbalota) { categoria = 'Tercer Premio'; premio = 3; }
      else if (aciertosNumeros === 4) { categoria = 'Cuarto Premio'; premio = 4; }
      else if (aciertosNumeros === 3 && aciertoSuperbalota) { categoria = 'Quinto Premio'; premio = 5; }
      else if (aciertosNumeros === 3) { categoria = 'Sexto Premio'; premio = 6; }
      else if (aciertosNumeros >= 0 && aciertoSuperbalota) { categoria = 'Reintegro'; premio = 7; }

      return { tipoSorteo, ganador: premio > 0, categoria, premio, aciertos: { numeros: aciertosNumeros, superbalota: aciertoSuperbalota }, numerosGanadores, superbalotaGanadora };
    };

    return {
      numerosUsuario: { numeros, superbalota },
      baloto: resultados.baloto ? verificarSorteo(numeros, superbalota, resultados.baloto.numeros, resultados.baloto.superbalota, 'Baloto') : null,
      revancha: resultados.revancha ? verificarSorteo(numeros, superbalota, resultados.revancha.numeros, resultados.revancha.superbalota, 'Revancha') : null,
      fecha: resultados.baloto?.fecha || resultados.revancha?.fecha
    };
  }

  async obtenerHistorico() {
    return this.obtenerUltimosResultados();
  }
}