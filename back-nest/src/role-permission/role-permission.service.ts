import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import { CreateRolePermissionDto } from './dto/create-role-permission.dto'
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto'

@Injectable()
export class RolePermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRolePermissionDto: CreateRolePermissionDto) {
    return this.prisma.rolePermission.create({
      data: {
        roleId: createRolePermissionDto.roleId,
        permissionId: createRolePermissionDto.permissionId
      }
    })
  }

  async findAll() {
    return this.prisma.rolePermission.findMany({
      include: { permission: true, role: true }
    })
  }

  async findOne(id: number) {
    return this.prisma.rolePermission.findUnique({
      where: { id },
      include: { permission: true, role: true }
    })
  }

  async update(id: number, updateRolePermissionDto: UpdateRolePermissionDto) {
    return this.prisma.rolePermission.update({
      where: { id },
      data: {
        ...updateRolePermissionDto
      }
    })
  }
  async updateState(
    where: Prisma.rolePermissionWhereInput,
    data: Prisma.rolePermissionUpdateInput
  ) {
    return this.prisma.rolePermission.updateMany({
      where,
      data
    })
  }

  async remove(id: number) {
    return this.prisma.rolePermission.delete({
      where: { id }
    })
  }
}
