import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator'
import { term } from '@prisma/client'

export class CreateTermGradeDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @IsNotEmpty()
  teachingAssignmentId: number

  @ApiProperty({ type: Number, example: 2 })
  @IsInt()
  @IsNotEmpty()
  studentId: number

  @ApiProperty({ enum: term, example: 'primerParcial' })
  @IsEnum(term)
  @IsNotEmpty()
  term: term

  @ApiProperty({ type: Number, example: 8.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  score: number

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  observations?: string

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  state?: boolean
}
