import { Test, TestingModule } from '@nestjs/testing';
import { MenuSectionPermissionController } from './menu-section-permission.controller';
import { MenuSectionPermissionService } from './menu-section-permission.service';

describe('MenuSectionPermissionController', () => {
  let controller: MenuSectionPermissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuSectionPermissionController],
      providers: [MenuSectionPermissionService],
    }).compile();

    controller = module.get<MenuSectionPermissionController>(MenuSectionPermissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
