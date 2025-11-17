import { Test, TestingModule } from '@nestjs/testing';
import { FilesModule } from '../files.module';
import { FilesService } from '../files.service';
import { FilesController } from '../files.controller';

describe('files.module.spec', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [FilesModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should contain files service and file controller ', () => {
    const service = module.get<FilesService>(FilesService);
    const controller = module.get<FilesController>(FilesController);

    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });
});
