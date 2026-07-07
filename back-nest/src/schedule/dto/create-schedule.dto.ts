import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator'
import { weekDay } from '@prisma/client'

export class CreateScheduleDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @IsNotEmpty()
  teachingAssignmentId: number

  @ApiProperty({
    enum: weekDay,
    example: 'lunes',
    description: 'Día de la semana (sin tildes)'
  })
  @IsEnum(weekDay)
  @IsNotEmpty()
  dayOfWeek: weekDay

  @ApiProperty({ type: String, example: '07:00:00', description: 'Hora ISO HH:mm:ss' })
  @IsString()
  @IsNotEmpty()
  startTime: string

  @ApiProperty({ type: String, example: '09:00:00', description: 'Hora ISO HH:mm:ss' })
  @IsString()
  @IsNotEmpty()
  endTime: string

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  state?: boolean
}
