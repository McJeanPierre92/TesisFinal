import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import {
  PaginatedResult,
  PaginationDto,
  buildPaginationParams
} from 'src/common/dto/pagination.dto'
import { CreateSubjectDto } from './dto/create-subject.dto'
import { UpdateSubjectDto } from './dto/update-subject.dto'

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({ data: createSubjectDto })
  }

  async findAll(query: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = buildPaginationParams(query)

    const where: Prisma.subjectWhereInput = {
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' }
      })
    }

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        skip,
        take,
        include: {
          institution: { select: { id: true, name: true } },
          _count: { select: { teachingAssignments: true } }
        },
        orderBy: { name: 'asc' }
      }),
      this.prisma.subject.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: { institution: { select: { id: true, name: true } } }
    })
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto) {
    return this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto,
      include: { institution: { select: { id: true, name: true } } }
    })
  }

  async remove(id: number) {
    return this.prisma.subject.delete({ where: { id } })
  }
}
