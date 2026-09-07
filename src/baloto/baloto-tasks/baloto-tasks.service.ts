// src/baloto/baloto-tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BalotoService } from '../baloto.service';

@Injectable()
export class BalotoTasksService {
  private readonly logger = new Logger(BalotoTasksService.name);

  constructor(private readonly balotoService: BalotoService) {}

  // Tarea 1: Ejecutar cada día a las 11:35 PM (después del sorteo)
  // Los sorteos son miércoles, viernes y sábado
  @Cron('35 23 * * 3,5,6', {
    name: 'actualizar-resultados-baloto',
    timeZone: 'America/Bogota', // Zona horaria de Colombia
  })
  async actualizarResultadosAutomaticamente() {
    this.logger.log('🕐 Iniciando actualización automática de resultados...');
    
    try {
      // Llamamos al servicio que ya tiene caché
      // Si el caché está vacío, hará scraping; si no, usará los datos guardados
      const resultados = await this.balotoService.obtenerUltimosResultados();
      
      this.logger.log('✅ Resultados actualizados automáticamente');
      this.logger.log(`Baloto: ${resultados.baloto[0]?.numeros.join(', ')} - Superbalota: ${resultados.baloto[0]?.superbalota}`);
      this.logger.log(`Revancha: ${resultados.revancha[0]?.numeros.join(', ')} - Superbalota: ${resultados.revancha[0]?.superbalota}`);
      
    } catch (error) {
      this.logger.error('❌ Error en actualización automática:', error);
    }
  }

  // Tarea 2: Verificar que el caché no esté vacío al iniciar el servidor
  @Cron(CronExpression.EVERY_HOUR)
  async verificarCaché() {
    this.logger.log('🔍 Verificando estado del caché...');
    
    try {
      await this.balotoService.obtenerUltimosResultados();
      this.logger.log('✅ Caché actualizado');
    } catch (error) {
      this.logger.error('❌ Error verificando caché:', error);
    }
  }
}
