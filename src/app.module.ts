// src/app.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule'; // ← NUEVO
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BalotoModule } from './baloto/baloto.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // ← NUEVO: Habilita las tareas programadas
    CacheModule.register({
      isGlobal: true, 
      ttl: 3600, 
    }),
    BalotoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
