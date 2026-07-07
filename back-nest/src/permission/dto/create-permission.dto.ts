import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreatePermissionDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  state?: boolean
}
