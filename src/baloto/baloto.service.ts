// src/baloto/baloto.service.ts
import { Injectable, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ResultadoBaloto, ResultadoRevancha } from './interfaces/resultado.interface';

@Injectable()
export class BalotoService {
   private readonly logger = new Logger(BalotoService.name);

  // ⚠️ ESTE CONSTRUCTOR ES NECESARIO
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async obtenerUltimosResultados(): Promise<{ baloto: ResultadoBaloto[]; revancha: ResultadoRevancha[] }> {
    let browser: Browser | undefined;
    
    try {
      // 1. Abrir Chrome local (NO descarga Chromium)
      // Ajusta esta ruta según donde tengas instalado Chrome en tu Windows
      browser = await chromium.launch({ 
        headless: true,
        executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Importante para evitar errores
      });
      
      const page = await browser.newPage();
      
      // 2. Navegar a la página
      this.logger.log('Navegando a baloto.com/resultados...');
      await page.goto('https://www.baloto.com/resultados', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // 3. Esperar a que la tabla de resultados esté visible
      // La tabla tiene la estructura que observamos en el HTML
      await page.waitForSelector('table', { timeout: 10000 });

      // 4. Extraer los datos de la tabla
      const resultados = await page.evaluate(() => {
        const filas = Array.from(document.querySelectorAll('table tbody tr'));
        
        return filas.map((fila, index) => {
          const celdas = fila.querySelectorAll('td');
          
          // Estructura observada: [vacío, fecha, números, acción]
          // Los números vienen en formato "11 - 12 - 17 - 28 - 31 - 15"
          const fecha = celdas[1]?.textContent?.trim() || '';
          const numerosTexto = celdas[2]?.textContent?.trim() || '';
          
          // Separar por guiones
          const partes = numerosTexto.split('-').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
          
          // Los primeros 5 son números principales, el último es superbalota
          const numeros = partes.slice(0, 5);
          const superbalota = partes[5] || 0;

          return {
            fecha,
            numeros,
            superbalota,
            esBaloto: index % 2 === 0 // Alterna entre Baloto y Revancha
          };
        });
      });

      this.logger.log(`Extraídos ${resultados.length} resultados`);

      // 5. Separar Baloto y Revancha
      const balotoResultados: ResultadoBaloto[] = [];
      const revanchaResultados: ResultadoRevancha[] = [];

      resultados.forEach((res, index) => {
        const resultado = {
          sorteo: index + 1,
          fecha: res.fecha,
          numeros: res.numeros,
          superbalota: res.superbalota,
        };

        if (res.esBaloto) {
          balotoResultados.push(resultado);
        } else {
          revanchaResultados.push(resultado);
        }
      });

      return {
        baloto: balotoResultados.slice(0, 10),
        revancha: revanchaResultados.slice(0, 10),
      };

    } catch (error: any) {
      this.logger.error('Error con Playwright:', error.message);
      
      if (error.message.includes('executablePath')) {
        throw new HttpException(
          'No se encontró Chrome. Verifica la ruta en el código.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      throw new HttpException(
        `Error al obtener datos de Baloto: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      if (browser) {
        await browser.close();
      }
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
  
  const verificarSorteo = (
    numerosUsuario: number[],
    superbalotaUsuario: number,
    numerosGanadores: number[],
    superbalotaGanadora: number,
    tipoSorteo: string
  ) => {
    // Contar aciertos
    const aciertosNumeros = numerosUsuario.filter(n => 
      numerosGanadores.includes(n)
    ).length;
    
    const aciertoSuperbalota = superbalotaUsuario === superbalotaGanadora;
    
    // Determinar categoría de premio
    let categoria = 'Sin premio';
    let premio = 0;
    
    if (aciertosNumeros === 5 && aciertoSuperbalota) {
      categoria = 'Premio Mayor';
      premio = 1;
    } else if (aciertosNumeros === 5) {
      categoria = 'Segundo Premio';
      premio = 2;
    } else if (aciertosNumeros === 4 && aciertoSuperbalota) {
      categoria = 'Tercer Premio';
      premio = 3;
    } else if (aciertosNumeros === 4) {
      categoria = 'Cuarto Premio';
      premio = 4;
    } else if (aciertosNumeros === 3 && aciertoSuperbalota) {
      categoria = 'Quinto Premio';
      premio = 5;
    } else if (aciertosNumeros === 3) {
      categoria = 'Sexto Premio';
      premio = 6;
    } else if (aciertosNumeros === 2 && aciertoSuperbalota) {
      categoria = 'Reintegro';
      premio = 7;
    } else if (aciertosNumeros === 1 && aciertoSuperbalota) {
      categoria = 'Reintegro';
      premio = 7;
    } else if (aciertosNumeros === 0 && aciertoSuperbalota) {
      categoria = 'Reintegro';
      premio = 7;
    }
    
    return {
      tipoSorteo,
      ganador: premio > 0,
      categoria,
      premio,
      aciertos: {
        numeros: aciertosNumeros,
        superbalota: aciertoSuperbalota
      },
      numerosGanadores,
      superbalotaGanadora
    };
  };
  
  const resultadoBaloto = resultados.baloto 
    ? verificarSorteo(
        numeros,
        superbalota,
        resultados.baloto.numeros,
        resultados.baloto.superbalota,
        'Baloto'
      )
    : null;
    
  const resultadoRevancha = resultados.revancha
    ? verificarSorteo(
        numeros,
        superbalota,
        resultados.revancha.numeros,
        resultados.revancha.superbalota,
        'Revancha'
      )
    : null;
  
  return {
    numerosUsuario: { numeros, superbalota },
    baloto: resultadoBaloto,
    revancha: resultadoRevancha,
    fecha: resultados.baloto?.fecha || resultados.revancha?.fecha
  };
}

// Agrega este método al final de la clase BalotoService

async obtenerHistorico(page: number = 1, limit: number = 10): Promise<{
  baloto: ResultadoBaloto[];
  revancha: ResultadoRevancha[];
  paginacion: {
    paginaActual: number;
    totalPaginas: number;
    resultadosPorPagina: number;
  };
}> {
  const cacheKey = `baloto_historico_pagina_${page}`;
  
  // 1. Intentar obtener del caché
  const cachedData = await this.cacheManager.get<{
    baloto: ResultadoBaloto[];
    revancha: ResultadoRevancha[];
  }>(cacheKey);

  if (cachedData) {
    this.logger.log(`⚡ Historico página ${page} desde CACHÉ`);
    return {
      ...cachedData,
      paginacion: {
        paginaActual: page,
        totalPaginas: 125,
        resultadosPorPagina: limit,
      },
    };
  }

  this.logger.log(`🕷️ Haciendo scraping de página ${page}...`);
  let browser: Browser | undefined;

  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const pageBrowser = await browser.newPage();

    // Construir URL con paginación
    // Baloto usa ?page=X para navegar entre páginas
    const url = page === 1 
      ? 'https://www.baloto.com/resultados'
      : `https://www.baloto.com/resultados?page=${page}`;

    await pageBrowser.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await pageBrowser.waitForSelector('table', { timeout: 10000 });

    const resultados = await pageBrowser.evaluate(() => {
      const filas = Array.from(document.querySelectorAll('table tbody tr'));
      
      return filas.map((fila, index) => {
        const celdas = fila.querySelectorAll('td');
        const sorteo = parseInt(celdas[0]?.textContent?.trim() || '0');
        const fecha = celdas[1]?.textContent?.trim() || '';
        const numerosTexto = celdas[2]?.textContent?.trim() || '';
        
        const partes = numerosTexto.split('-').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        
        return {
          sorteo,
          fecha,
          numeros: partes.slice(0, 5),
          superbalota: partes[5] || 0,
          esBaloto: index % 2 === 0,
        };
      });
    });

    const balotoResultados: ResultadoBaloto[] = [];
    const revanchaResultados: ResultadoRevancha[] = [];

    resultados.forEach((res) => {
      if (res.esBaloto) {
        balotoResultados.push(res);
      } else {
        revanchaResultados.push(res);
      }
    });

    const datosFinales = {
      baloto: balotoResultados,
      revancha: revanchaResultados,
    };

    // Guardar en caché por 24 horas (86400 segundos)
    // El historial no cambia, así que podemos cachearlo más tiempo
    await this.cacheManager.set(cacheKey, datosFinales, 86400);
    this.logger.log(`✅ Página ${page} guardada en caché`);

    return {
      ...datosFinales,
      paginacion: {
        paginaActual: page,
        totalPaginas: 125,
        resultadosPorPagina: limit,
      },
    };

  } catch (error: any) {
    this.logger.error(`Error obteniendo página ${page}:`, error.message);
    throw new HttpException(
      `Error al obtener historial: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
}