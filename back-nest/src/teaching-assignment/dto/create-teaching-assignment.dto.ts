import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional
} from 'class-validator'

export class CreateTeachingAssignmentDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @IsNotEmpty()
  subjectId: number

  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @IsNotEmpty()
  classGroupId: number

  @ApiProperty({ type: Number, example: 3 })
  @IsInt()
  @IsNotEmpty()
  teacherId: number

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  state?: boolean
}
