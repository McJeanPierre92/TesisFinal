import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator'

export class CreateMenuSectionDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  key: string

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  label: string

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  href: string

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  icon: string

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsNotEmpty()
  order: number

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  parentId?: number | null

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  state: boolean
}
