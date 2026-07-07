import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateUserDto } from './dto/create-user.dto'
import { FindAllUserDto } from './dto/find-all-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Get()
  @ApiResponse({ status: 200, type: [FindAllUserDto] })
  findAll() {
    return this.userService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id)
  }

  @Patch('update')
  async update(@Body() updateUserDto: UpdateUserDto) {
    const { password, ...rest } = updateUserDto
    const user = updateUserDto.password === '' ? rest : updateUserDto

    await this.userService.update(updateUserDto.id, user)

    return {
      message: 'Usuario actualizado',
      status: 200
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id)

    return {
      message: 'Usuario eliminado',
      status: 200
    }
  }
}
