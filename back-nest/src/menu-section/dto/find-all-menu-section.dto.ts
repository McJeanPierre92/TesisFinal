import { ApiProperty } from '@nestjs/swagger'

export class FindAllMenuSectionDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  key: string

  @ApiProperty()
  label: string

  @ApiProperty()
  href: string

  @ApiProperty()
  icon: string

  @ApiProperty()
  order: number

  @ApiProperty({ required: false, nullable: true })
  parentId?: number | null

  @ApiProperty()
  state: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
