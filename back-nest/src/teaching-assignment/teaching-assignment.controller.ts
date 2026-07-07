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
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto'
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto'
import { TeachingAssignmentService } from './teaching-assignment.service'

@ApiTags('teaching-assignment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('teaching-assignment')
export class TeachingAssignmentController {
  constructor(
    private readonly teachingAssignmentService: TeachingAssignmentService
  ) {}

  @Post()
  @RequirePermission('teaching-assignment', 'create')
  create(@Body() createTeachingAssignmentDto: CreateTeachingAssignmentDto) {
    return this.teachingAssignmentService.create(createTeachingAssignmentDto)
  }

  @Get()
  @RequirePermission('teaching-assignment', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.teachingAssignmentService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('teaching-assignment', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachingAssignmentService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('teaching-assignment', 'update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeachingAssignmentDto: UpdateTeachingAssignmentDto
  ) {
    return this.teachingAssignmentService.update(
      id,
      updateTeachingAssignmentDto
    )
  }

  @Delete(':id')
  @RequirePermission('teaching-assignment', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teachingAssignmentService.remove(id)
  }
}
