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
  Req,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RequestWithUser } from 'src/auth/auth.controller'
import { CreateMenuSectionDto } from './dto/create-menu-section.dto'
import { UpdateMenuSectionDto } from './dto/update-menu-section.dto'
import { MenuSectionService } from './menu-section.service'

@Controller('menu-section')
export class MenuSectionController {
  constructor(private readonly menuSectionService: MenuSectionService) {}

  @Post()
  async create(@Body() createMenuSectionDto: CreateMenuSectionDto) {
    await this.menuSectionService.create(createMenuSectionDto)

    return {
      message: 'Created menu section successfully',
      statusCode: 201
    }
  }

  @Get()
  findAll(@Query('state') state: boolean) {
    return this.menuSectionService.findAll({
      state
    })
  }

  @Get('find-by-user')
  @UseGuards(AuthGuard('jwt'))
  findAllByUser(@Req() req: RequestWithUser) {
    const user = req.user

    if (!user) new UnauthorizedException()

    return this.menuSectionService.findAll({
      state: true,
      permissions: {
        some: {
          roleId: user.roleId
        }
      }
    })
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuSectionService.findOne({ id })
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuSectionDto: UpdateMenuSectionDto
  ) {
    await this.menuSectionService.update(id, updateMenuSectionDto)

    return {
      message: 'Updated menu section successfully',
      statusCode: 200
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.menuSectionService.remove(id)

    return {
      message: 'Deleted menu section successfully',
      statusCode: 200
    }
  }
}
