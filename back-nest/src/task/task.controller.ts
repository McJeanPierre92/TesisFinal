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
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { TaskService } from './task.service'

@ApiTags('task')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @RequirePermission('task', 'create')
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto)
  }

  @Get()
  @RequirePermission('task', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.taskService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('task', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('task', 'update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto
  ) {
    return this.taskService.update(id, updateTaskDto)
  }

  @Delete(':id')
  @RequirePermission('task', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.remove(id)
  }
}
