import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import {
  PaginatedResult,
  PaginationDto,
  buildPaginationParams
} from 'src/common/dto/pagination.dto'
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto'
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto'

@Injectable()
export class TeachingAssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeachingAssignmentDto: CreateTeachingAssignmentDto) {
    return this.prisma.teachingAssignment.create({
      data: createTeachingAssignmentDto
    })
  }

  async findAll(query: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = buildPaginationParams(query)

    const where: Prisma.teachingAssignmentWhereInput = {}

    const [data, total] = await Promise.all([
      this.prisma.teachingAssignment.findMany({
        where,
        skip,
        take,
        include: {
          subject: { select: { id: true, name: true } },
          classGroup: {
            select: {
              id: true,
              parallel: true,
              level: { select: { id: true, name: true } }
            }
          },
          teacher: {
            select: { id: true, name: true, userName: true }
          },
          _count: {
            select: { lessons: true, tasks: true, schedules: true }
          }
        },
        orderBy: { id: 'asc' }
      }),
      this.prisma.teachingAssignment.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    return this.prisma.teachingAssignment.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true } },
        classGroup: {
          select: {
            id: true,
            parallel: true,
            level: { select: { id: true, name: true } }
          }
        },
        teacher: { select: { id: true, name: true, userName: true } },
        schedules: { orderBy: { dayOfWeek: 'asc' } }
      }
    })
  }

  async update(id: number, updateTeachingAssignmentDto: UpdateTeachingAssignmentDto) {
    return this.prisma.teachingAssignment.update({
      where: { id },
      data: updateTeachingAssignmentDto,
      include: {
        subject: { select: { id: true, name: true } },
        classGroup: {
          select: { id: true, parallel: true, level: { select: { id: true, name: true } } }
        },
        teacher: { select: { id: true, name: true, userName: true } }
      }
    })
  }

  async remove(id: number) {
    return this.prisma.teachingAssignment.delete({ where: { id } })
  }
}
