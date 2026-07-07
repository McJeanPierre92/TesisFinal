import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import {
  PaginatedResult,
  PaginationDto,
  buildPaginationParams
} from 'src/common/dto/pagination.dto'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    const { startTime, endTime, ...rest } = createScheduleDto
    return this.prisma.schedule.create({
      data: {
        ...rest,
        startTime: new Date(`1970-01-01T${startTime}Z`),
        endTime: new Date(`1970-01-01T${endTime}Z`)
      }
    })
  }

  async findAll(query: PaginationDto = {}): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = buildPaginationParams(query)

    const where: Prisma.scheduleWhereInput = {}

    const [data, total] = await Promise.all([
      this.prisma.schedule.findMany({
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
              },
              teacher: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
      }),
      this.prisma.schedule.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    return this.prisma.schedule.findUnique({
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
            },
            teacher: { select: { id: true, name: true } }
          }
        }
      }
    })
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto) {
    const { startTime, endTime, ...rest } = updateScheduleDto
    const data: Prisma.scheduleUpdateInput = { ...rest }
    if (startTime) {
      data.startTime = new Date(`1970-01-01T${startTime}Z`)
    }
    if (endTime) {
      data.endTime = new Date(`1970-01-01T${endTime}Z`)
    }
    return this.prisma.schedule.update({ where: { id }, data })
  }

  async remove(id: number) {
    return this.prisma.schedule.delete({ where: { id } })
  }
}
