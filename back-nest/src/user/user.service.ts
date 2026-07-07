import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByUserName(where: Prisma.userWhereUniqueInput) {
    return this.prisma.user.findUnique({
      where,
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    })
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        userName: createUserDto.userName,
        password: hashedPassword,
        role: { connect: { id: createUserDto.roleId } }
      },
      select: {
        id: true,
        name: true,
        userName: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    })
  }

  async findAll() {
    return this.prisma.user.findMany({
      omit: { password: true },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              include: { permission: true }
            }
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    })
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        userName: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              include: { permission: true }
            }
          }
        },
        state: true
      }
    })
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const data = { ...updateUserDto }
    if (updateUserDto?.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10)
    }

    delete data.id
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        userName: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    })
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        userName: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    })
  }
}
