import { Test, TestingModule } from '@nestjs/testing';
import { BalotoTasksService } from './baloto-tasks.service';
import { BalotoService } from '../baloto.service';

describe('BalotoTasksService', () => {
  let service: BalotoTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalotoTasksService,
        {
          provide: BalotoService,
          useValue: {
            obtenerUltimosResultados: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BalotoTasksService>(BalotoTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});