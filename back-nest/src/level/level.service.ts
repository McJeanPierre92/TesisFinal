import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import {
  PaginatedResult,
  PaginationDto,
  buildPaginationParams
} from 'src/common/dto/pagination.dto'
import { CreateLevelDto } from './dto/create-level.dto'
import { UpdateLevelDto } from './dto/update-level.dto'

@Injectable()
export class LevelService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLevelDto: CreateLevelDto) {
    return this.prisma.level.create({ data: createLevelDto })
  }

  async findAll(query: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = buildPaginationParams(query)

    const where: Prisma.levelWhereInput = {
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' }
      })
    }

    const [data, total] = await Promise.all([
      this.prisma.level.findMany({
        where,
        skip,
        take,
        include: {
          institution: { select: { id: true, name: true } },
          _count: { select: { classGroups: true } }
        },
        orderBy: [{ order: 'asc' }, { id: 'asc' }]
      }),
      this.prisma.level.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    return this.prisma.level.findUnique({
      where: { id },
      include: {
        institution: { select: { id: true, name: true } },
        classGroups: { orderBy: { parallel: 'asc' } }
      }
    })
  }

  async update(id: number, updateLevelDto: UpdateLevelDto) {
    return this.prisma.level.update({
      where: { id },
      data: updateLevelDto,
      include: { institution: { select: { id: true, name: true } } }
    })
  }

  async remove(id: number) {
    return this.prisma.level.delete({ where: { id } })
  }
}
