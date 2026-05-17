import { Test, TestingModule } from '@nestjs/testing';
import { AttendaceService } from './attendace.service';

describe('AttendaceService', () => {
  let service: AttendaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendaceService],
    }).compile();

    service = module.get<AttendaceService>(AttendaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
