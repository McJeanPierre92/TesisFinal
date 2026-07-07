import { Test, TestingModule } from '@nestjs/testing';
import { MenuSectionController } from './menu-section.controller';
import { MenuSectionService } from './menu-section.service';

describe('MenuSectionController', () => {
  let controller: MenuSectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuSectionController],
      providers: [MenuSectionService],
    }).compile();

    controller = module.get<MenuSectionController>(MenuSectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
