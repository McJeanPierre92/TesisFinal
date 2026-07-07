import { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  title: string
  subtitle?: string
  /** Color del tile del icono. Por defecto primario (rojo). */
  tone?: 'primary' | 'success' | 'warning' | 'info'
  /** Acciones a la derecha (ej: botón "Nuevo") */
  actions?: React.ReactNode
}

const TONES: Record<NonNullable<Props['tone']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/20 text-warning-foreground',
  info: 'bg-info/15 text-info'
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  tone = 'primary',
  actions
}: Props) {
  return (
    <div className='flex items-start justify-between gap-4'>
      <div className='flex items-center gap-3 min-w-0'>
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${TONES[tone]}`}
        >
          <Icon className='w-6 h-6' />
        </div>
        <div className='min-w-0'>
          <h1 className='text-2xl font-bold text-foreground leading-tight truncate font-serif tracking-tight'>
            {title}
          </h1>
          {subtitle && (
            <p className='text-sm text-muted-foreground mt-1 font-medium'>{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className='flex items-center gap-2 shrink-0'>{actions}</div>}
    </div>
  )
}
