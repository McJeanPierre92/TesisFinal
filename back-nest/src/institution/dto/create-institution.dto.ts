import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateInstitutionDto {
  @ApiProperty({ type: String, example: 'ULEAM' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  state?: boolean
}
