import { Module } from '@nestjs/common'
import { MenuSectionPermissionController } from './menu-section-permission.controller'
import { MenuSectionPermissionService } from './menu-section-permission.service'

@Module({
  controllers: [MenuSectionPermissionController],
  providers: [MenuSectionPermissionService]
})
export class MenuSectionPermissionModule {}
