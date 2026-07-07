'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

type Tone = 'primary' | 'success' | 'warning' | 'info'

const TONES: Record<Tone, { tile: string; ring: string }> = {
  primary: { tile: 'bg-primary text-primary-foreground', ring: 'ring-primary/20' },
  success: { tile: 'bg-success text-success-foreground', ring: 'ring-success/20' },
  warning: {
    tile: 'bg-warning text-warning-foreground',
    ring: 'ring-warning/20'
  },
  info: { tile: 'bg-info text-info-foreground', ring: 'ring-info/20' }
}

type Props = {
  icon: LucideIcon
  label: string
  value: number | string
  hint?: string
  tone?: Tone
}

/** Count-up animado para valores numéricos. */
function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'primary' }: Props) {
  const isNumeric = typeof value === 'number'
  const display = isNumeric ? useCountUp(value as number) : (value as string)

  const t = TONES[tone]

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Card className={`overflow-hidden ring-1 ${t.ring} hover:shadow-md transition-shadow`}>
        <CardContent className='flex items-center gap-4 p-5'>
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${t.tile}`}
          >
            <Icon className='w-6 h-6' />
          </div>
          <div className='flex flex-col min-w-0'>
            <span className='text-3xl font-bold text-foreground leading-none tabular-nums'>
              {display}
            </span>
            <span className='text-sm text-muted-foreground mt-1 truncate'>{label}</span>
            {hint && (
              <span className='text-xs text-muted-foreground/80 mt-0.5 truncate'>
                {hint}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
