import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { taskType } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator'

class OptionDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  text: string

  @ApiProperty({ type: Boolean })
  isCorrect: boolean
}

class QuestionDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  text: string

  @ApiProperty({ type: [OptionDto] })
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[]
}

export class CreateTaskByTeacherDto {
  @ApiProperty({ type: Number })
  @IsInt()
  @IsNotEmpty()
  teachingAssignmentId: number

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  lessonId?: number

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ enum: taskType, default: 'documento' })
  @IsOptional()
  @IsEnum(taskType)
  type?: taskType

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dueDate?: string

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxScore?: number

  @ApiPropertyOptional({ type: [QuestionDto], description: 'Solo para type=examen' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions?: QuestionDto[]
}
