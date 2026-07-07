import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import {
  PaginatedResult,
  PaginationDto,
  buildPaginationParams
} from 'src/common/dto/pagination.dto'
import { CreateEnrollmentDto } from './dto/create-enrollment.dto'
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto'

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    return this.prisma.enrollment.create({ data: createEnrollmentDto })
  }

  async findAll(query: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = buildPaginationParams(query)

    const where: Prisma.enrollmentWhereInput = {}

    const [data, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip,
        take,
        include: {
          classGroup: {
            select: {
              id: true,
              parallel: true,
              level: { select: { id: true, name: true } }
            }
          },
          student: {
            select: { id: true, name: true, userName: true }
          }
        },
        orderBy: { id: 'asc' }
      }),
      this.prisma.enrollment.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    return this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        classGroup: {
          select: {
            id: true,
            parallel: true,
            level: { select: { id: true, name: true } }
          }
        },
        student: { select: { id: true, name: true, userName: true } }
      }
    })
  }

  async update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.prisma.enrollment.update({
      where: { id },
      data: updateEnrollmentDto
    })
  }

  async remove(id: number) {
    return this.prisma.enrollment.delete({ where: { id } })
  }
}
