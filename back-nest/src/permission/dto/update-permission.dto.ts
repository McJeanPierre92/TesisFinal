import { PartialType } from '@nestjs/swagger'
import { IsNumber, IsOptional } from 'class-validator'
import { CreatePermissionDto } from './create-permission.dto'

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @IsOptional()
  @IsNumber()
  id: number
}
