import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator'

export class CreateLessonDto {
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

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  state?: boolean
}
