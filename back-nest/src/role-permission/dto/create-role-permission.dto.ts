import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsNotEmpty } from 'class-validator'

export class CreateRolePermissionDto {
  @ApiProperty({ type: Number })
  @IsInt()
  @IsNotEmpty()
  roleId: number

  @ApiProperty({ type: Number })
  @IsInt()
  @IsNotEmpty()
  permissionId: number

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  state: boolean
}
