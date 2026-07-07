'use client'

import { ControllerFormField } from '@/components/form/ControllerFormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormManagement } from '@/hooks/useFormManagement'
import { login } from '@/modules/auth/application/auth/login'
import { AuthLogin } from '@/modules/auth/domain/auth'
import { AuthLoginSchema } from '@/modules/auth/domain/authLogin'
import { apiAuth } from '@/modules/auth/infrastructure/apiAuth'
import { getAllByUserMenuSection } from '@/modules/menu-section/application/getAll/getAllByUserMenuSection'
import { apiMenuSection } from '@/modules/menu-section/infrastructure/apiMenuSection'
import { GraduationCap, Eye, Lock, LogIn, User } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { toast } from 'sonner'
import { DEFAULT_VALUES } from './defaultValues'

const authApi = apiAuth()
const menuApi = apiMenuSection()

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { form } = useFormManagement<AuthLogin>({
    defaultValues: DEFAULT_VALUES,
    schema: AuthLoginSchema
  })

  const getMenuSections = async () => {
    try {
      const menuSections = await getAllByUserMenuSection(menuApi)()

      if (menuSections.length === 0) {
        toast.error('No se encontraron secciones de menú')
        return
      }

      router.push(menuSections[0].href)
    } catch (err) {
      toast.error('No se pudo conectar con el servidor')
    }
  }

  const onSubmit = async (values: AuthLogin) => {
    setIsLoading(true)
    try {
      const result = await login(authApi)(values)

      if (result?.error) {
        toast.error('Credenciales Incorrectas')
        return
      }

      if (redirect && redirect !== '/login' && redirect !== '/') {
        router.push(redirect)
        return
      }
      await getMenuSections()
    } catch (err) {
      toast.error('No se pudo conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-stretch'>
      {/* Panel izquierdo con degradado (como el prototipo) */}
      <div className='hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative overflow-hidden text-white'
        style={{
          background:
            'repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(255,255,255,0.015) 60px, rgba(255,255,255,0.015) 120px), linear-gradient(145deg, oklch(0.36 0.13 25) 0%, oklch(0.42 0.16 25) 35%, oklch(0.52 0.15 25) 65%, oklch(0.6 0.14 25) 100%)'
        }}
      >
        {/* Círculos decorativos blur */}
        <div className='absolute right-[-100px] top-[-100px] w-[400px] h-[400px] rounded-full bg-white/[0.06] blur-sm' />
        <div className='absolute left-[-60px] bottom-[-60px] w-[280px] h-[280px] rounded-full bg-white/[0.04] blur-[1px]' />

        <div className='relative z-10 max-w-md'>
          <div className='inline-flex items-center justify-center w-15 h-15 bg-white/[0.12] backdrop-blur-md border border-white/10 rounded-2xl mb-9 p-4'>
            <GraduationCap className='w-7 h-7 text-white' />
          </div>
          <h1 className='text-[44px] font-semibold leading-[1.08] mb-4 tracking-tight font-serif'>
            Plataforma de Aprendizaje
          </h1>
          <p className='text-[17px] opacity-85 mb-11 leading-relaxed font-light max-w-[400px]'>
            Gestiona tus cursos, tareas y calificaciones en un solo lugar de forma sencilla.
          </p>
          <div className='flex flex-col gap-[18px]'>
            <div className='flex items-center gap-3.5 text-sm opacity-90'>
              <span className='w-2 h-2 rounded-full bg-[#fcd9a8] shadow-[0_0_8px_rgba(252,217,168,0.4)]' />
              Acceso a tus materias y paralelos
            </div>
            <div className='flex items-center gap-3.5 text-sm opacity-90'>
              <span className='w-2 h-2 rounded-full bg-[#fcd9a8] shadow-[0_0_8px_rgba(252,217,168,0.4)]' />
              Entrega de tareas en línea
            </div>
            <div className='flex items-center gap-3.5 text-sm opacity-90'>
              <span className='w-2 h-2 rounded-full bg-[#fcd9a8] shadow-[0_0_8px_rgba(252,217,168,0.4)]' />
              Consulta tus notas y avances
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho: card de login */}
      <div className='flex-1 flex items-center justify-center bg-card p-12'>
        <div className='w-full max-w-[360px]'>
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-6 shadow-lg shadow-primary/25'>
              <GraduationCap className='w-6 h-6 text-primary-foreground' />
            </div>
            <h2 className='text-[26px] font-semibold mb-1.5 font-serif text-foreground'>
              Bienvenido
            </h2>
            <p className='text-muted-foreground text-[13px]'>
              Inicia sesión para acceder
            </p>
          </div>

          <Form {...form}>
            <form className='space-y-5' onSubmit={form.handleSubmit(onSubmit)}>
              <div className='space-y-1.5'>
                <ControllerFormField
                  form={form}
                  label='Usuario'
                  name='userName'
                >
                  {(field) => (
                    <div className='relative group'>
                      <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none'>
                        <User className='h-5 w-5 text-muted-foreground group-focus-within:text-primary' />
                      </div>
                      <Input
                        {...field}
                        placeholder='Usuario'
                        className='block w-full pl-10 pr-3 py-3 border-[1.5px] border-border rounded-[10px] focus:outline-none focus:ring-[3px] focus:ring-primary/[0.08] focus:border-primary text-sm placeholder:text-muted-foreground bg-[#fdfcfa] text-foreground transition-all'
                      />
                    </div>
                  )}
                </ControllerFormField>
              </div>

              <div className='space-y-1.5'>
                <ControllerFormField
                  form={form}
                  label='Contraseña'
                  name='password'
                >
                  {(field) => (
                    <div className='relative group'>
                      <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none'>
                        <Lock className='h-5 w-5 text-muted-foreground group-focus-within:text-primary' />
                      </div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                        placeholder='Contraseña'
                        className='block w-full pl-10 pr-10 py-3 border-[1.5px] border-border rounded-[10px] focus:outline-none focus:ring-[3px] focus:ring-primary/[0.08] focus:border-primary text-sm placeholder:text-muted-foreground bg-[#fdfcfa] text-foreground transition-all'
                      />
                      <Eye
                        className='absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary transition-colors'
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </div>
                  )}
                </ControllerFormField>
              </div>

              <Button
                type='submit'
                disabled={isLoading}
                className='w-full flex justify-center items-center py-3 px-4 rounded-[10px] text-sm font-semibold bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
              >
                {isLoading ? (
                  <>
                    <div className='w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2'></div>
                    Iniciando...
                  </>
                ) : (
                  <>
                    <LogIn className='w-5 h-5 mr-2' />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className='text-center mt-6 text-xs text-muted-foreground'>
            Demo: admin / profesor / alumno · pass: 123456
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
