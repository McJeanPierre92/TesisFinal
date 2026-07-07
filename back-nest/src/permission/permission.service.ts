import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import { CreatePermissionDto } from './dto/create-permission.dto'
import { UpdatePermissionDto } from './dto/update-permission.dto'

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: createPermissionDto
    })
  }

  async findAll() {
    return this.prisma.permission.findMany({
      include: { roles: { select: { role: true } } }
    })
  }

  async findOne(id: number) {
    return this.prisma.permission.findUnique({
      where: { id }
    })
  }

  async updatePermissionState(id: number, state: boolean) {
    return this.prisma.permission.update({
      where: { id },
      data: { state }
    })
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return this.prisma.permission.update({
      where: { id },
      data: {
        ...updatePermissionDto
      }
    })
  }

  async remove(id: number) {
    return this.prisma.permission.delete({
      where: { id }
    })
  }
}
