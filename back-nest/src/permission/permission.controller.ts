import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post
} from '@nestjs/common'
import { CreatePermissionDto } from './dto/create-permission.dto'
import { UpdatePermissionDto } from './dto/update-permission.dto'
import { PermissionService } from './permission.service'

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto)
  }

  @Get()
  findAll() {
    return this.permissionService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(+id)
  }

  @Patch(':id/state')
  async updatePermissionState(
    @Param('id') id: string,
    @Body('state') state: boolean
  ) {
    await this.permissionService.updatePermissionState(+id, state)
    return { message: 'Estado del permiso actualizado', status: 200 }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto
  ) {
    return this.permissionService.update(+id, updatePermissionDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id)
  }
}
