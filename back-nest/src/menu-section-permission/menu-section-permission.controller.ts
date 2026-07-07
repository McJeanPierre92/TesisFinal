import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post
} from '@nestjs/common'
import { CreateMenuSectionPermissionDto } from './dto/create-menu-section-permission.dto'
import { UpdateMenuSectionPermissionDto } from './dto/update-menu-section-permission.dto'
import { MenuSectionPermissionService } from './menu-section-permission.service'

@Controller('menu-section-permission')
export class MenuSectionPermissionController {
  constructor(
    private readonly menuSectionPermissionService: MenuSectionPermissionService
  ) {}

  @Post()
  create(
    @Body() createMenuSectionPermissionDto: CreateMenuSectionPermissionDto
  ) {
    return this.menuSectionPermissionService.create(
      createMenuSectionPermissionDto
    )
  }

  @Get()
  findAll() {
    return this.menuSectionPermissionService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuSectionPermissionService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMenuSectionPermissionDto: UpdateMenuSectionPermissionDto
  ) {
    return this.menuSectionPermissionService.update(
      +id,
      updateMenuSectionPermissionDto
    )
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuSectionPermissionService.remove(+id)
  }
}
