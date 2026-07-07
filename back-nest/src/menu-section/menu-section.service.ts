import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import { CreateMenuSectionDto } from './dto/create-menu-section.dto'
import { UpdateMenuSectionDto } from './dto/update-menu-section.dto'

@Injectable()
export class MenuSectionService {
  constructor(private readonly prisma: PrismaService) {}

  private async collectTreeIds(rootId: number) {
    const visited = new Set<number>()
    const queue: number[] = [rootId]

    while (queue.length) {
      const batch = queue.splice(0, 50)
      batch.forEach((id) => visited.add(id))

      const children = await this.prisma.menuSection.findMany({
        where: { parentId: { in: batch } },
        select: { id: true }
      })

      for (const child of children) {
        if (!visited.has(child.id)) {
          queue.push(child.id)
        }
      }
    }

    return Array.from(visited)
  }

  create(createMenuSectionDto: CreateMenuSectionDto) {
    return this.prisma.menuSection.create({
      data: createMenuSectionDto
    })
  }

  findAll(where?: Prisma.menuSectionWhereInput) {
    return this.prisma.menuSection.findMany({
      where,
      include: {
        children: true,
        permissions: {
          include: {
            role: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })
  }

  findOne(where: Prisma.menuSectionWhereUniqueInput) {
    return this.prisma.menuSection.findUnique({
      where,
      include: {
        children: true,
        permissions: {
          include: {
            role: true
          }
        }
      }
    })
  }

  update(id: number, updateMenuSectionDto: UpdateMenuSectionDto) {
    return this.prisma.menuSection.update({
      where: { id },
      data: updateMenuSectionDto
    })
  }

  async remove(id: number) {
    const exists = await this.prisma.menuSection.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!exists) {
      throw new NotFoundException('Menu section not found')
    }

    const ids = await this.collectTreeIds(id)

    await this.prisma.$transaction(async (tx) => {
      await tx.menuSectionPermission.deleteMany({
        where: { menuSectionId: { in: ids } }
      })

      await tx.menuSection.deleteMany({
        where: { id: { in: ids } }
      })
    })

    return { deletedIds: ids }
  }
}
