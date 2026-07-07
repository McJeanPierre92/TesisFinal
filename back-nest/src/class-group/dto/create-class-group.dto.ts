import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator'

export class CreateClassGroupDto {
  @ApiProperty({ type: String, example: 'A' })
  @IsString()
  @IsNotEmpty()
  parallel: string

  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @IsNotEmpty()
  levelId: number

  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @IsNotEmpty()
  institutionId: number

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  state?: boolean
}
