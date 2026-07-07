import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator'

export class CreateLessonByTeacherDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @IsNotEmpty()
  teachingAssignmentId: number

  @ApiProperty({ type: String, example: 'Introducción a las fracciones' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  content?: string

  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @IsInt()
  order?: number
}
