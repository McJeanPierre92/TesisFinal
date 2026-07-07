import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { PermissionsGuard, RequirePermission } from 'src/common/guards/guard'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { CreateClassGroupDto } from './dto/create-class-group.dto'
import { UpdateClassGroupDto } from './dto/update-class-group.dto'
import { ClassGroupService } from './class-group.service'

@ApiTags('class-group')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('class-group')
export class ClassGroupController {
  constructor(private readonly classGroupService: ClassGroupService) {}

  @Post()
  @RequirePermission('class-group', 'create')
  create(@Body() createClassGroupDto: CreateClassGroupDto) {
    return this.classGroupService.create(createClassGroupDto)
  }

  @Get()
  @RequirePermission('class-group', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.classGroupService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('class-group', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classGroupService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('class-group', 'update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassGroupDto: UpdateClassGroupDto
  ) {
    return this.classGroupService.update(id, updateClassGroupDto)
  }

  @Delete(':id')
  @RequirePermission('class-group', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classGroupService.remove(id)
  }
}
