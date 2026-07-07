import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import {
  PaginatedResult,
  PaginationDto,
  buildPaginationParams
} from 'src/common/dto/pagination.dto'
import { CreateClassGroupDto } from './dto/create-class-group.dto'
import { UpdateClassGroupDto } from './dto/update-class-group.dto'

@Injectable()
export class ClassGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClassGroupDto: CreateClassGroupDto) {
    return this.prisma.classGroup.create({ data: createClassGroupDto })
  }

  async findAll(query: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = buildPaginationParams(query)

    const where: Prisma.classGroupWhereInput = {
      ...(query.search && {
        parallel: { contains: query.search, mode: 'insensitive' }
      })
    }

    const [data, total] = await Promise.all([
      this.prisma.classGroup.findMany({
        where,
        skip,
        take,
        include: {
          level: { select: { id: true, name: true, order: true } },
          institution: { select: { id: true, name: true } },
          _count: {
            select: { enrollments: true, teachingAssignments: true }
          }
        },
        orderBy: [{ level: { order: 'asc' } }, { parallel: 'asc' }]
      }),
      this.prisma.classGroup.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    return this.prisma.classGroup.findUnique({
      where: { id },
      include: {
        level: { select: { id: true, name: true, order: true } },
        institution: { select: { id: true, name: true } },
        enrollments: {
          include: {
            student: {
              select: { id: true, name: true, userName: true }
            }
          }
        },
        teachingAssignments: {
          include: {
            subject: { select: { id: true, name: true } },
            teacher: {
              select: { id: true, name: true, userName: true }
            }
          }
        }
      }
    })
  }

  async update(id: number, updateClassGroupDto: UpdateClassGroupDto) {
    return this.prisma.classGroup.update({
      where: { id },
      data: updateClassGroupDto,
      include: {
        level: { select: { id: true, name: true } },
        institution: { select: { id: true, name: true } }
      }
    })
  }

  async remove(id: number) {
    return this.prisma.classGroup.delete({ where: { id } })
  }
}
