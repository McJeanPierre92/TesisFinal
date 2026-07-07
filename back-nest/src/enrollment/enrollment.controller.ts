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
import { CreateEnrollmentDto } from './dto/create-enrollment.dto'
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto'
import { EnrollmentService } from './enrollment.service'

@ApiTags('enrollment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @RequirePermission('enrollment', 'create')
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(createEnrollmentDto)
  }

  @Get()
  @RequirePermission('enrollment', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.enrollmentService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('enrollment', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('enrollment', 'update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto
  ) {
    return this.enrollmentService.update(id, updateEnrollmentDto)
  }

  @Delete(':id')
  @RequirePermission('enrollment', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentService.remove(id)
  }
}
