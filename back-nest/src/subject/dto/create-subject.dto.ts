import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator'

export class CreateSubjectDto {
  @ApiProperty({ type: String, example: 'Matemáticas' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @IsNotEmpty()
  institutionId: number

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  state?: boolean
}
