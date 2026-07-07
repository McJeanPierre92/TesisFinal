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
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { ScheduleService } from './schedule.service'

@ApiTags('schedule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @RequirePermission('schedule', 'create')
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto)
  }

  @Get()
  @RequirePermission('schedule', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.scheduleService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('schedule', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('schedule', 'update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto
  ) {
    return this.scheduleService.update(id, updateScheduleDto)
  }

  @Delete(':id')
  @RequirePermission('schedule', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.remove(id)
  }
}
