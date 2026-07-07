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
import { CreateGradeDto } from './dto/create-grade.dto'
import { UpdateGradeDto } from './dto/update-grade.dto'
import { GradeService } from './grade.service'

@ApiTags('grade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('grade')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  @RequirePermission('grade', 'create')
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradeService.create(createGradeDto)
  }

  @Get()
  @RequirePermission('grade', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.gradeService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('grade', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gradeService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('grade', 'update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGradeDto: UpdateGradeDto
  ) {
    return this.gradeService.update(id, updateGradeDto)
  }

  @Delete(':id')
  @RequirePermission('grade', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gradeService.remove(id)
  }
}
