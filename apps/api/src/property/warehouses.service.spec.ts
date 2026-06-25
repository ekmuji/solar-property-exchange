import { Test, TestingModule } from '@nestjs/testing';
import { WarehousesService } from './warehouses.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.module'; // Adjust path if needed

const mockPrismaService = {
  warehouse: {
    findMany: jest.fn().mockResolvedValue([{ id: 'test-1', name: 'Mock Warehouse' }]),
    count: jest.fn().mockResolvedValue(1),
  },
};

const mockRedisService = {
  invalidate: jest.fn(),
};

describe('WarehousesService', () => {
  let service: WarehousesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehousesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<WarehousesService>(WarehousesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated search results', async () => {
    const result = await service.search({ page: 1, limit: 10 });
    
    expect(result.data.length).toBe(1);
    expect(result.data[0].name).toBe('Mock Warehouse');
    expect(result.total).toBe(1);
    expect(mockPrismaService.warehouse.findMany).toHaveBeenCalled();
  });
});