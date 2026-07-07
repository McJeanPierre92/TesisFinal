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
import { CreateLevelDto } from './dto/create-level.dto'
import { UpdateLevelDto } from './dto/update-level.dto'
import { LevelService } from './level.service'

@ApiTags('level')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Post()
  @RequirePermission('level', 'create')
  create(@Body() createLevelDto: CreateLevelDto) {
    return this.levelService.create(createLevelDto)
  }

  @Get()
  @RequirePermission('level', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.levelService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('level', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.levelService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('level', 'update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLevelDto: UpdateLevelDto
  ) {
    return this.levelService.update(id, updateLevelDto)
  }

  @Delete(':id')
  @RequirePermission('level', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.levelService.remove(id)
  }
}
