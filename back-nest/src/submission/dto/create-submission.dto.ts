import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator'
import { submissionStatus } from '@prisma/client'

export class CreateSubmissionDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @IsNotEmpty()
  taskId: number

  @ApiProperty({ type: Number, example: 2 })
  @IsInt()
  @IsNotEmpty()
  studentId: number

  @ApiPropertyOptional({ type: String, example: '/uploads/2-12345-tarea.pdf' })
  @IsOptional()
  @IsString()
  fileUrl?: string

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  comment?: string

  @ApiPropertyOptional({
    enum: submissionStatus,
    example: 'entregada',
    default: 'pendiente'
  })
  @IsOptional()
  @IsEnum(submissionStatus)
  status?: submissionStatus

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  state?: boolean
}
