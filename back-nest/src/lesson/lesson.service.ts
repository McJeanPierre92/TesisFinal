import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import {
  PaginatedResult,
  PaginationDto,
  buildPaginationParams
} from 'src/common/dto/pagination.dto'
import { CreateLessonDto } from './dto/create-lesson.dto'
import { UpdateLessonDto } from './dto/update-lesson.dto'

@Injectable()
export class LessonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto) {
    return this.prisma.lesson.create({ data: createLessonDto })
  }

  async findAll(query: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = buildPaginationParams(query)

    const where: Prisma.lessonWhereInput = {
      ...(query.search && {
        title: { contains: query.search, mode: 'insensitive' }
      })
    }

    const [data, total] = await Promise.all([
      this.prisma.lesson.findMany({
        where,
        skip,
        take,
        include: {
          teachingAssignment: {
            select: {
              id: true,
              subject: { select: { id: true, name: true } },
              classGroup: {
                select: {
                  id: true,
                  parallel: true,
                  level: { select: { id: true, name: true } }
                }
              }
            }
          },
          _count: { select: { tasks: true } }
        },
        orderBy: [{ order: 'asc' }, { id: 'asc' }]
      }),
      this.prisma.lesson.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    return this.prisma.lesson.findUnique({
      where: { id },
      include: {
        teachingAssignment: {
          select: {
            id: true,
            subject: { select: { id: true, name: true } },
            classGroup: {
              select: {
                id: true,
                parallel: true,
                level: { select: { id: true, name: true } }
              }
            }
          }
        },
        tasks: { orderBy: { id: 'asc' } }
      }
    })
  }

  async update(id: number, updateLessonDto: UpdateLessonDto) {
    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto
    })
  }

  async remove(id: number) {
    return this.prisma.lesson.delete({ where: { id } })
  }
}
