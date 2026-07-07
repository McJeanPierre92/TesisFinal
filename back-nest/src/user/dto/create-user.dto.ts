import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  userName: string

  @ApiPropertyOptional({ type: String })
  @IsString()
  password: string

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsNotEmpty()
  roleId: number

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsBoolean()
  state: boolean
}
