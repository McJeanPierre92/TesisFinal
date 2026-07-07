import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import {
  PaginatedResult,
  PaginationDto,
  buildPaginationParams
} from 'src/common/dto/pagination.dto'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import { UpdateSubmissionDto } from './dto/update-submission.dto'

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubmissionDto: CreateSubmissionDto) {
    return this.prisma.submission.create({ data: createSubmissionDto })
  }

  async findAll(query: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = buildPaginationParams(query)

    const where: Prisma.submissionWhereInput = {}

    const [data, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        skip,
        take,
        include: {
          task: {
            select: {
              id: true,
              title: true,
              maxScore: true,
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
              }
            }
          },
          student: { select: { id: true, name: true, userName: true } },
          grade: true
        },
        orderBy: { submittedAt: 'desc' }
      }),
      this.prisma.submission.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    return this.prisma.submission.findUnique({
      where: { id },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            maxScore: true,
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
            }
          }
        },
        student: { select: { id: true, name: true, userName: true } },
        grade: {
          include: {
            gradedBy: { select: { id: true, name: true } }
          }
        }
      }
    })
  }

  async update(id: number, updateSubmissionDto: UpdateSubmissionDto) {
    return this.prisma.submission.update({
      where: { id },
      data: updateSubmissionDto
    })
  }

  async remove(id: number) {
    return this.prisma.submission.delete({ where: { id } })
  }
}
