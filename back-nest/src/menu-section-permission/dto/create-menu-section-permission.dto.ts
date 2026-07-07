import { ApiProperty } from '@nestjs/swagger'
import { IsInt } from 'class-validator'

export class CreateMenuSectionPermissionDto {
  @ApiProperty()
  @IsInt()
  menuSectionId: number

  @ApiProperty()
  @IsInt()
  roleId: number
}
