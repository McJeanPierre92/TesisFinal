import { Test, TestingModule } from '@nestjs/testing';
import { MenuSectionPermissionService } from './menu-section-permission.service';

describe('MenuSectionPermissionService', () => {
  let service: MenuSectionPermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MenuSectionPermissionService],
    }).compile();

    service = module.get<MenuSectionPermissionService>(MenuSectionPermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
