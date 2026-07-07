import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class PaginationDto {
  @ApiPropertyOptional({ type: Number, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ type: Number, minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  search?: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function buildPaginationParams(query: PaginationDto) {
  const page = query.page && query.page > 0 ? query.page : 1
  const limit = query.limit && query.limit > 0 ? query.limit : 10
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit
  }
}
