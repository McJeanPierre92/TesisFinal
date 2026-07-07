import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateRoleDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  state?: boolean

  @ApiPropertyOptional({ type: Array })
  @IsOptional()
  permissions: Prisma.rolePermissionUncheckedCreateInput[]
}
