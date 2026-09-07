import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BalotoService } from './baloto.service';

describe('BalotoService', () => {
  let service: BalotoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalotoService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BalotoService>(BalotoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});