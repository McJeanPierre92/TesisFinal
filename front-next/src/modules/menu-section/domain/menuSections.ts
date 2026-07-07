export type MenuSection = {
  id: number
  key: string
  label: string
  href: string
  icon: string
  order: number
  parentId?: number | null
  state?: boolean
}

export type MenuSectionView = MenuSection & {
  children?: MenuSection[]
  permissions?: { id: number; name: string }[]
}
