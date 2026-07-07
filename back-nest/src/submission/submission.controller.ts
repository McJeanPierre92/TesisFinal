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
import { CreateSubmissionDto } from './dto/create-submission.dto'
import { UpdateSubmissionDto } from './dto/update-submission.dto'
import { SubmissionService } from './submission.service'

@ApiTags('submission')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @RequirePermission('submission', 'create')
  create(@Body() createSubmissionDto: CreateSubmissionDto) {
    return this.submissionService.create(createSubmissionDto)
  }

  @Get()
  @RequirePermission('submission', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.submissionService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('submission', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.submissionService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('submission', 'update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubmissionDto: UpdateSubmissionDto
  ) {
    return this.submissionService.update(id, updateSubmissionDto)
  }

  @Delete(':id')
  @RequirePermission('submission', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.submissionService.remove(id)
  }
}
