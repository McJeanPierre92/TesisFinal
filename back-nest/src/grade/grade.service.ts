import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import {
  PaginatedResult,
  PaginationDto,
  buildPaginationParams
} from 'src/common/dto/pagination.dto'
import { CreateGradeDto } from './dto/create-grade.dto'
import { UpdateGradeDto } from './dto/update-grade.dto'

@Injectable()
export class GradeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGradeDto: CreateGradeDto) {
    // upsert: si la entrega ya tiene nota, se actualiza; si no, se crea.
    return this.prisma.grade.upsert({
      where: { submissionId: createGradeDto.submissionId },
      create: {
        submissionId: createGradeDto.submissionId,
        score: createGradeDto.score,
        feedback: createGradeDto.feedback,
        gradedById: createGradeDto.gradedById
      },
      update: {
        score: createGradeDto.score,
        feedback: createGradeDto.feedback,
        gradedById: createGradeDto.gradedById,
        gradedAt: new Date()
      }
    })
  }

  async findAll(query: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = buildPaginationParams(query)

    const where: Prisma.gradeWhereInput = {}

    const [data, total] = await Promise.all([
      this.prisma.grade.findMany({
        where,
        skip,
        take,
        include: {
          submission: {
            select: {
              id: true,
              taskId: true,
              studentId: true,
              task: {
                select: {
                  id: true,
                  title: true,
                  maxScore: true,
                  teachingAssignment: {
                    select: {
                      id: true,
                      subject: { select: { id: true, name: true } }
                    }
                  }
                }
              },
              student: { select: { id: true, name: true, userName: true } }
            }
          },
          gradedBy: { select: { id: true, name: true } }
        },
        orderBy: { gradedAt: 'desc' }
      }),
      this.prisma.grade.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    return this.prisma.grade.findUnique({
      where: { id },
      include: {
        submission: {
          select: {
            id: true,
            taskId: true,
            studentId: true,
            task: { select: { id: true, title: true, maxScore: true } },
            student: { select: { id: true, name: true, userName: true } }
          }
        },
        gradedBy: { select: { id: true, name: true } }
      }
    })
  }

  async update(id: number, updateGradeDto: UpdateGradeDto) {
    return this.prisma.grade.update({
      where: { id },
      data: updateGradeDto
    })
  }

  async remove(id: number) {
    return this.prisma.grade.delete({ where: { id } })
  }
}
