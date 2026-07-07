'use client'

import { Schedule, WeekDay } from '@/modules/academic/domain/academic'
import { getSubjectColor } from '@/constants/subjectColors'
import { motion } from 'motion/react'
import { BookOpen } from 'lucide-react'
import { useState } from 'react'

// Días a mostrar (Lunes..Viernes)
const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'] as const

const DAY_LABELS: Record<string, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
}

const DAY_SHORT: Record<string, string> = {
  lunes: 'Lun',
  martes: 'Mar',
  miercoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie'
}

export type TimetableEntry = Schedule & {
  subjectName: string
  parallel?: string
  levelName?: string
  teacherName?: string
}

// Extrae HH:mm directamente del string ISO (evita desfase de zona horaria)
function timeToMinutes(iso: string): number {
  const m = /T(\d{2}):(\d{2})/.exec(iso)
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0
}

function formatTime(iso: string): string {
  const m = /T(\d{2}):(\d{2})/.exec(iso)
  return m ? `${m[1]}:${m[2]}` : iso
}

type Props = {
  entries: TimetableEntry[]
  showTeacher?: boolean
}

export function WeeklyTimetable({ entries, showTeacher = true }: Props) {
  const [isMobile, setIsMobile] = useState(false)

  // Detectar móvil en el cliente (evita hydration mismatch)
  if (typeof window !== 'undefined') {
    // Actualiza el estado solo si cambió (no causa re-render infinito porque
    // window.matchMedia es estable)
    const mobile = window.matchMedia('(max-width: 768px)').matches
    if (mobile !== isMobile) {
      // defer para evitar setState durante render
      setTimeout(() => setIsMobile(mobile), 0)
    }
  }

  if (isMobile) {
    return <MobileSchedule entries={entries} showTeacher={showTeacher} />
  }
  return <DesktopGrid entries={entries} showTeacher={showTeacher} />
}

// ============================================================
//  VISTA ESCRITORIO — grilla semanal
// ============================================================
function DesktopGrid({ entries, showTeacher }: Props) {
  const START_HOUR = 7
  const END_HOUR = 18
  const SLOT_MINUTES = 30 // resolución: cada fila = 30 min
  const SLOT_HEIGHT = 28 // px por slot de 30 min
  const HOUR_WIDTH = 56

  // Generar slots: array de minutos desde START a END
  const slots: number[] = []
  for (let m = START_HOUR * 60; m < END_HOUR * 60; m += SLOT_MINUTES) {
    slots.push(m)
  }

  // Mapea día -> entradas ordenadas por hora de inicio
  const byDay: Record<string, TimetableEntry[]> = {}
  DAYS.forEach((d) => (byDay[d] = []))
  entries.forEach((e) => {
    if (byDay[e.dayOfWeek]) byDay[e.dayOfWeek].push(e)
  })
  DAYS.forEach((d) =>
    byDay[d].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
  )

  return (
    <div className='overflow-x-auto'>
      <div className='min-w-[680px]'>
        {/* Cabecera de días */}
        <div
          className='grid gap-1 mb-1'
          style={{ gridTemplateColumns: `${HOUR_WIDTH}px repeat(${DAYS.length}, 1fr)` }}
        >
          <div />
          {DAYS.map((d) => (
            <div
              key={d}
              className='text-center text-xs font-bold text-sidebar-foreground py-2.5 rounded-lg bg-sidebar'
            >
              {DAY_LABELS[d]}
            </div>
          ))}
        </div>

        {/* Grilla: un div por día, posición absoluta para bloques */}
        <div
          className='grid gap-1'
          style={{ gridTemplateColumns: `${HOUR_WIDTH}px repeat(${DAYS.length}, 1fr)` }}
        >
          {/* Columna de horas */}
          <div className='relative'>
            {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i).map(
              (h) => (
                <div
                  key={h}
                  className='absolute right-2 text-[10px] font-medium text-muted-foreground tabular-nums -translate-y-1.5'
                  style={{ top: (h - START_HOUR) * 60 * (SLOT_HEIGHT / SLOT_MINUTES) }}
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              )
            )}
          </div>

          {/* Columnas de días */}
          {DAYS.map((day) => {
            const dayEntries = byDay[day] || []
            return (
              <div
                key={day}
                className='relative rounded-lg overflow-hidden'
                style={{
                  height: (END_HOUR - START_HOUR) * 60 * (SLOT_HEIGHT / SLOT_MINUTES),
                  background:
                    'repeating-linear-gradient(to bottom, var(--muted) 0 1px, transparent 1px ' +
                      SLOT_HEIGHT * 2 +
                      'px)'
                }}
              >
                {dayEntries.map((entry) => {
                  const startMin = timeToMinutes(entry.startTime)
                  const endMin = timeToMinutes(entry.endTime)
                  const top =
                    (startMin - START_HOUR * 60) * (SLOT_HEIGHT / SLOT_MINUTES)
                  const height = Math.max(
                    (endMin - startMin) * (SLOT_HEIGHT / SLOT_MINUTES) - 2,
                    40
                  )
                  const color = getSubjectColor(entry.subjectName)
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className={`absolute left-1 right-1 rounded-lg ${color.tile} p-2 overflow-hidden shadow-sm border-l-4 ${color.text.replace('text-', 'border-')}`}
                      style={{ top, height }}
                    >
                      <div className='flex items-start gap-1'>
                        <BookOpen className='w-3 h-3 mt-0.5 shrink-0' />
                        <div className='min-w-0'>
                          <p className='text-[11px] font-bold leading-tight truncate'>
                            {entry.subjectName}
                          </p>
                          <p className='text-[9px] opacity-80 leading-tight'>
                            {entry.levelName} {entry.parallel}
                          </p>
                          <p className='text-[9px] opacity-70 leading-tight tabular-nums'>
                            {formatTime(entry.startTime)} -{' '}
                            {formatTime(entry.endTime)}
                          </p>
                          {showTeacher && entry.teacherName && (
                            <p className='text-[9px] opacity-70 leading-tight truncate'>
                              {entry.teacherName}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================================
//  VISTA MÓVIL — cards apiladas por día (acordeón)
// ============================================================
function MobileSchedule({ entries, showTeacher }: Props) {
  const [openDay, setOpenDay] = useState<string | null>(null)

  // Agrupar por día
  const byDay: Record<string, TimetableEntry[]> = {}
  DAYS.forEach((d) => (byDay[d] = []))
  entries.forEach((e) => {
    if (byDay[e.dayOfWeek]) byDay[e.dayOfWeek].push(e)
  })
  DAYS.forEach((d) =>
    byDay[d].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
  )

  const hasAny = DAYS.some((d) => (byDay[d] || []).length > 0)

  if (!hasAny) {
    return (
      <p className='text-sm text-muted-foreground text-center py-8'>
        No tienes clases programadas.
      </p>
    )
  }

  return (
    <div className='space-y-2'>
      {DAYS.map((day) => {
        const dayEntries = byDay[day] || []
        if (dayEntries.length === 0) return null
        const isOpen = openDay === day
        return (
          <div
            key={day}
            className='border border-border rounded-xl overflow-hidden bg-card'
          >
            {/* Cabecera del día (clickeable) */}
            <button
              onClick={() => setOpenDay(isOpen ? null : day)}
              className='w-full flex items-center justify-between px-4 py-3 bg-muted/60'
            >
              <span className='font-bold text-sm'>{DAY_LABELS[day]}</span>
              <span className='text-xs text-muted-foreground'>
                {dayEntries.length}{' '}
                {dayEntries.length === 1 ? 'clase' : 'clases'}
              </span>
            </button>

            {/* Lista de clases del día */}
            <div className='divide-y divide-border'>
              {dayEntries.map((entry) => {
                const color = getSubjectColor(entry.subjectName)
                return (
                  <div key={entry.id} className='flex items-start gap-3 p-3'>
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${color.tile}`}
                    >
                      <BookOpen className='w-4 h-4' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='font-semibold text-sm text-foreground'>
                        {entry.subjectName}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {entry.levelName} {entry.parallel}
                      </p>
                      <p className='text-xs text-muted-foreground tabular-nums mt-0.5'>
                        🕐 {formatTime(entry.startTime)} -{' '}
                        {formatTime(entry.endTime)}
                      </p>
                      {showTeacher && entry.teacherName && (
                        <p className='text-xs text-muted-foreground mt-0.5'>
                          👤 {entry.teacherName}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
