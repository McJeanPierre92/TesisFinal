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
import { CreateSubjectDto } from './dto/create-subject.dto'
import { UpdateSubjectDto } from './dto/update-subject.dto'
import { SubjectService } from './subject.service'

@ApiTags('subject')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @RequirePermission('subject', 'create')
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectService.create(createSubjectDto)
  }

  @Get()
  @RequirePermission('subject', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.subjectService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('subject', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('subject', 'update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDto: UpdateSubjectDto
  ) {
    return this.subjectService.update(id, updateSubjectDto)
  }

  @Delete(':id')
  @RequirePermission('subject', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.remove(id)
  }
}
