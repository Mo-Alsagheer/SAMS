import { Test, TestingModule } from '@nestjs/testing';
import { AttendaceController } from './attendace.controller';
import { AttendaceService } from './attendace.service';

describe('AttendaceController', () => {
  let controller: AttendaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendaceController],
      providers: [AttendaceService],
    }).compile();

    controller = module.get<AttendaceController>(AttendaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
