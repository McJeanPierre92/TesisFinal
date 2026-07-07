import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common'
import { CreateRolePermissionDto } from './dto/create-role-permission.dto'
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto'
import { RolePermissionService } from './role-permission.service'

@Controller('role-permission')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post()
  create(@Body() createRolePermissionDto: CreateRolePermissionDto) {
    return this.rolePermissionService.create(createRolePermissionDto)
  }

  @Get()
  findAll() {
    return this.rolePermissionService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolePermissionService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolePermissionDto: UpdateRolePermissionDto
  ) {
    return this.rolePermissionService.update(id, updateRolePermissionDto)
  }

  @Patch(':roleId/:permissionId')
  updateState(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Body('data') data: UpdateRolePermissionDto
  ) {
    return this.rolePermissionService.updateState(
      { roleId, permissionId },
      data
    )
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolePermissionService.remove(+id)
  }
}
