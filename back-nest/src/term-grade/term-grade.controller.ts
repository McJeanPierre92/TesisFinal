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
import { CreateTermGradeDto } from './dto/create-term-grade.dto'
import { UpdateTermGradeDto } from './dto/update-term-grade.dto'
import { TermGradeService } from './term-grade.service'

@ApiTags('term-grade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('term-grade')
export class TermGradeController {
  constructor(private readonly termGradeService: TermGradeService) {}

  @Post()
  @RequirePermission('term-grade', 'create')
  create(@Body() createTermGradeDto: CreateTermGradeDto) {
    return this.termGradeService.create(createTermGradeDto)
  }

  @Get()
  @RequirePermission('term-grade', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.termGradeService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('term-grade', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.termGradeService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('term-grade', 'update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTermGradeDto: UpdateTermGradeDto
  ) {
    return this.termGradeService.update(id, updateTermGradeDto)
  }

  @Delete(':id')
  @RequirePermission('term-grade', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.termGradeService.remove(id)
  }
}
