import { getOneAuth } from '@/modules/auth/application/getOne/getOneAuth'
import { logout } from '@/modules/auth/application/getOne/logout'
import { Auth } from '@/modules/auth/domain/auth'
import { apiAuth } from '@/modules/auth/infrastructure/apiAuth'
import { getAllByUserMenuSection } from '@/modules/menu-section/application/getAll/getAllByUserMenuSection'
import { MenuSection } from '@/modules/menu-section/domain/menuSections'
import { apiMenuSection } from '@/modules/menu-section/infrastructure/apiMenuSection'
import { usePathname, useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

interface AuthContextType {
  user: Auth | null
  logout: () => Promise<void>
  isLoading: boolean
  menuSections: MenuSection[]
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authRepository = apiAuth()
const menuSectionRepository = apiMenuSection()

export function AuthProvider({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<Auth | null>(null)
  const [menuSections, setMenuSections] = useState<MenuSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const getMenuSections = useCallback(async () => {
    const data = await getAllByUserMenuSection(menuSectionRepository)()
    setMenuSections(data)
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const data = await getOneAuth(authRepository)()

      if (data?.statusCode === 401 || !data) {
        setIsLoading(false)
        setUser(null)
        setMenuSections([])

        if (pathname === '/login' || pathname === '/' || pathname.startsWith('/share')) {
          return
        }
        router.push('/login?redirect=' + pathname)
        return
      }

      setUser(data)
      await getMenuSections()
      setIsLoading(false)
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setIsLoading(false)
    }
  }, [pathname, router, getMenuSections])

  const logoutUser = useCallback(async () => {
    try {
      await logout(authRepository)()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }, [router])

  const validateCurrentRoute = useCallback(() => {
    if (pathname.startsWith('/share')) {
      setIsLoading(false)
      return
    }

    if (!user || isLoading || menuSections.length === 0) {
      setIsLoading(false)
      return
    }

    const isValidRoute = menuSections.some(
      (section) =>
        pathname === section.href || pathname.startsWith(`${section.href}/`)
    )

    if (!isValidRoute && menuSections[0]?.href) {
      router.push(menuSections[0].href)
    }
  }, [user, isLoading, menuSections, pathname, router])

  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (pathname === '/login') {
      return
    }

    const isPublicRoute = pathname === '/' || pathname.startsWith('/share')

    if (!user && !isLoading && !isPublicRoute) {
      checkAuth()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user, isLoading])

  useEffect(() => {
    if (user && menuSections.length > 0) {
      validateCurrentRoute()
    }
  }, [pathname, user, menuSections, validateCurrentRoute])

  const values = useMemo(() => {
    return {
      user,
      logout: logoutUser,
      isLoading,
      menuSections,
      checkAuth
    }
  }, [user, logoutUser, isLoading, menuSections, checkAuth])

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
