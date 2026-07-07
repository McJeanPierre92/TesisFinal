import { ApiProperty } from '@nestjs/swagger'

export class FindAllMenuSectionPermissionDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  menuSectionId: number

  @ApiProperty()
  roleId: number

  // Opcional: puedes incluir los objetos relacionados si los incluyes en la consulta
  // @ApiProperty({ type: () => MenuSection, required: false })
  // menuSection?: MenuSection

  // @ApiProperty({ type: () => Permission, required: false })
  // permission?: Permission
}
