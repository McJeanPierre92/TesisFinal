import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator'

export class CreateGradeByTeacherDto {
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
}
