import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const { permissions, ...data } = createRoleDto

    const role = await this.prisma.role.create({
      data
    })

    if (permissions && permissions.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission.permissionId
        }))
      })
    }

    return this.prisma.role.findUnique({
      where: { id: role.id },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    })
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true }
        },
        users: { select: { name: true } }
      },
      orderBy: [{ id: 'asc' }]
    })
  }

  async findOne(id: number) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    })
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const { permissions, ...data } = updateRoleDto

    await this.prisma.role.update({
      where: { id },
      data
    })

    if (permissions.length > 0) {
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } })
      await this.prisma.rolePermission.createMany({
        data: permissions
      })
    }

    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    })
  }

  async remove(id: number) {
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } })
    return this.prisma.role.delete({ where: { id } })
  }
}
