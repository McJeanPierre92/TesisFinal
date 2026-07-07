import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import { CreateMenuSectionPermissionDto } from './dto/create-menu-section-permission.dto'
import { UpdateMenuSectionPermissionDto } from './dto/update-menu-section-permission.dto'

@Injectable()
export class MenuSectionPermissionService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMenuSectionPermissionDto: CreateMenuSectionPermissionDto) {
    return this.prisma.menuSectionPermission.create({
      data: createMenuSectionPermissionDto
    })
  }

  findAll(where?: Prisma.menuSectionPermissionWhereInput) {
    return this.prisma.menuSectionPermission.findMany({
      where,
      include: {
        menuSection: true,
        role: true
      }
    })
  }

  findOne(id: number) {
    return this.prisma.menuSectionPermission.findUnique({
      where: { id },
      include: {
        menuSection: true,
        role: true
      }
    })
  }

  update(
    id: number,
    updateMenuSectionPermissionDto: UpdateMenuSectionPermissionDto
  ) {
    return this.prisma.menuSectionPermission.update({
      where: { id },
      data: updateMenuSectionPermissionDto
    })
  }

  remove(id: number) {
    return this.prisma.menuSectionPermission.delete({
      where: { id }
    })
  }
}
