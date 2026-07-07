import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import {
  PaginatedResult,
  PaginationDto,
  buildPaginationParams
} from 'src/common/dto/pagination.dto'
import { CreateInstitutionDto } from './dto/create-institution.dto'
import { UpdateInstitutionDto } from './dto/update-institution.dto'

@Injectable()
export class InstitutionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInstitutionDto: CreateInstitutionDto) {
    return this.prisma.institution.create({ data: createInstitutionDto })
  }

  async findAll(
    query: PaginationDto = {}
  ): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = buildPaginationParams(query)

    const where: Prisma.institutionWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } }
          ]
        }
      : {}

    const [data, total] = await Promise.all([
      this.prisma.institution.findMany({
        where,
        skip,
        take,
        orderBy: { id: 'asc' }
      }),
      this.prisma.institution.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    return this.prisma.institution.findUnique({
      where: { id },
      include: {
        levels: { orderBy: { order: 'asc' } },
        subjects: { orderBy: { name: 'asc' } },
        classGroups: { orderBy: { id: 'asc' } }
      }
    })
  }

  async update(id: number, updateInstitutionDto: UpdateInstitutionDto) {
    return this.prisma.institution.update({
      where: { id },
      data: updateInstitutionDto
    })
  }

  async remove(id: number) {
    return this.prisma.institution.delete({ where: { id } })
  }
}
