import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator'

export class CreateGradeDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @IsNotEmpty()
  submissionId: number

  @ApiProperty({ type: Number, example: 9.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  score: number

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  feedback?: string

  @ApiProperty({ type: Number, example: 3 })
  @IsInt()
  @IsNotEmpty()
  gradedById: number

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  state?: boolean
}
