import { PartialType } from '@nestjs/swagger';
import { CreateMenuSectionPermissionDto } from './create-menu-section-permission.dto';

export class UpdateMenuSectionPermissionDto extends PartialType(CreateMenuSectionPermissionDto) {}
