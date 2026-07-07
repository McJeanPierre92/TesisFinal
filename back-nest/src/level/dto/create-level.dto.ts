import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator'

export class CreateLevelDto {
  @ApiProperty({ type: String, example: '8vo' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ type: Number, example: 8 })
  @IsOptional()
  @IsInt()
  order?: number

  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @IsNotEmpty()
  institutionId: number

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  state?: boolean
}
