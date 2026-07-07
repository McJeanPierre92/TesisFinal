import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional
} from 'class-validator'

export class CreateEnrollmentDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @IsNotEmpty()
  classGroupId: number

  @ApiProperty({ type: Number, example: 2 })
  @IsInt()
  @IsNotEmpty()
  studentId: number

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  state?: boolean
}
