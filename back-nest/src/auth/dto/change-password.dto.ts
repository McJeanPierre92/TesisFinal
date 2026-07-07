import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({ type: String, description: 'Contraseña actual' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string

  @ApiProperty({ type: String, description: 'Contraseña nueva (mínimo 6 caracteres)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  newPassword: string
}
