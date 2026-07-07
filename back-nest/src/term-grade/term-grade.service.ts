import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import {
  PaginatedResult,
  PaginationDto,
  buildPaginationParams
} from 'src/common/dto/pagination.dto'
import { CreateTermGradeDto } from './dto/create-term-grade.dto'
import { UpdateTermGradeDto } from './dto/update-term-grade.dto'

@Injectable()
export class TermGradeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTermGradeDto: CreateTermGradeDto) {
    return this.prisma.termGrade.create({ data: createTermGradeDto })
  }

  async findAll(query: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = buildPaginationParams(query)

    const where: Prisma.termGradeWhereInput = {}

    const [data, total] = await Promise.all([
      this.prisma.termGrade.findMany({
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
          student: { select: { id: true, name: true, userName: true } }
        },
        orderBy: { id: 'desc' }
      }),
      this.prisma.termGrade.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    return this.prisma.termGrade.findUnique({
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
        student: { select: { id: true, name: true, userName: true } }
      }
    })
  }

  async update(id: number, updateTermGradeDto: UpdateTermGradeDto) {
    return this.prisma.termGrade.update({
      where: { id },
      data: updateTermGradeDto
    })
  }

  async remove(id: number) {
    return this.prisma.termGrade.delete({ where: { id } })
  }
}
