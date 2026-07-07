'use client'

import { useAuth } from '@/context/AuthContext'
import { MenuSection } from '@/modules/menu-section/domain/menuSections'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const findBreadcrumbName = (href: string, menuSections: MenuSection[]) => {
  const findName = (items: any[]): string | null => {
    if (!Array.isArray(items)) return ''
    const foundItem = items.find((item) => item.href === href)
    if (foundItem) return foundItem.label

    for (const item of items) {
      if (item.children && item.children.length > 0) {
        const childName = findName(item.children)
        if (childName) return childName
      }
    }
    return null
  }

  return findName(menuSections) || href.split('/').pop()
}

const Breadcrumbs = () => {
  const pathname = usePathname()
  const { menuSections = [] } = useAuth()
  const pathSegments = pathname.split('/').filter(Boolean)

  return (
    <nav className='text-sm text-gray-600'>
      <ul className='flex space-x-2'>
        <li>
          <Link href='/' className='text-blue-500 hover:underline'>
            Home
          </Link>
        </li>
        {pathSegments.map((_segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`
          const isLast = index === pathSegments.length - 1
          const name = findBreadcrumbName(href, menuSections)

          return (
            <li key={href} className='flex items-center'>
              <span className='mx-2'>/</span>
              {isLast ? (
                <span className='text-gray-400'>{name}</span>
              ) : (
                <Link href={href} className='text-blue-500 hover:underline'>
                  {name}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default Breadcrumbs
