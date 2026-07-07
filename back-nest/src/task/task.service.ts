import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import {
  PaginatedResult,
  PaginationDto,
  buildPaginationParams
} from 'src/common/dto/pagination.dto'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({ data: createTaskDto })
  }

  async findAll(query: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = buildPaginationParams(query)

    const where: Prisma.taskWhereInput = {
      ...(query.search && {
        title: { contains: query.search, mode: 'insensitive' }
      })
    }

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
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
          lesson: { select: { id: true, title: true } },
          _count: { select: { submissions: true } }
        },
        orderBy: { id: 'desc' }
      }),
      this.prisma.task.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    return this.prisma.task.findUnique({
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
        lesson: { select: { id: true, title: true } }
      }
    })
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto
    })
  }

  async remove(id: number) {
    return this.prisma.task.delete({ where: { id } })
  }
}
