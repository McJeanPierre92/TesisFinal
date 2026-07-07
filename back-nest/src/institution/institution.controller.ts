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
import { CreateInstitutionDto } from './dto/create-institution.dto'
import { UpdateInstitutionDto } from './dto/update-institution.dto'
import { InstitutionService } from './institution.service'

@ApiTags('institution')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('institution')
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Post()
  @RequirePermission('institution', 'create')
  create(@Body() createInstitutionDto: CreateInstitutionDto) {
    return this.institutionService.create(createInstitutionDto)
  }

  @Get()
  @RequirePermission('institution', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.institutionService.findAll(query)
  }

  @Get(':id')
  @RequirePermission('institution', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.institutionService.findOne(id)
  }

  @Patch(':id')
  @RequirePermission('institution', 'update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInstitutionDto: UpdateInstitutionDto
  ) {
    return this.institutionService.update(id, updateInstitutionDto)
  }

  @Delete(':id')
  @RequirePermission('institution', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.institutionService.remove(id)
  }
}
