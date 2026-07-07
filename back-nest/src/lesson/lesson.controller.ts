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
import { CreateLessonDto } from './dto/create-lesson.dto'
import { UpdateLessonDto } from './dto/update-lesson.dto'
import { LessonService } from './lesson.service'

@ApiTags('lesson')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @RequirePermission('lesson', 'create')
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.create(createLessonDto)
  }

  @Get()
  @RequirePermission('lesson', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.lessonService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('lesson', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('lesson', 'update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto
  ) {
    return this.lessonService.update(id, updateLessonDto)
  }

  @Delete(':id')
  @RequirePermission('lesson', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.remove(id)
  }
}
