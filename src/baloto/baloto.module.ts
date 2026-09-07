import { Module } from '@nestjs/common';
import { BalotoService } from './baloto.service';
import { BalotoController } from './baloto.controller';
import { BalotoTasksService } from './baloto-tasks/baloto-tasks.service';

@Module({
  providers: [BalotoService, BalotoTasksService],
  controllers: [BalotoController],
  imports: []
})
export class BalotoModule {}
