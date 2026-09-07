import { Test, TestingModule } from '@nestjs/testing';
import { BalotoController } from './baloto.controller';
import { BalotoService } from './baloto.service';

describe('BalotoController', () => {
  let controller: BalotoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalotoController],
      providers: [
        {
          provide: BalotoService,
          useValue: {
            obtenerUltimoResultado: jest.fn(),
            obtenerHistorico: jest.fn(),
            verificarNumeros: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BalotoController>(BalotoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});