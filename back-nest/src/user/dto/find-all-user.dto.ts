import { ApiProperty } from '@nestjs/swagger'
import { Role } from 'src/role/entities/role.entity'

export class FindAllUserDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty()
  userName: string

  @ApiProperty()
  roleId: number

  @ApiProperty({ type: () => Role })
  role: Role

  @ApiProperty()
  state: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
