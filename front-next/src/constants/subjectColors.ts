// Paleta de colores consistente por materia.
// Cada materia recibe un color determinista (hash del nombre) para que siempre
// se vea igual (Matemáticas siempre azul, etc.).

export type SubjectColor = {
  /** Clases Tailwind para el tile del icono (fondo suave + texto) */
  tile: string
  /** Color sólido para bordes/acento */
  solid: string
  /** Color de texto sobre el sólido */
  text: string
  /** Hex para gráficos (recharts) */
  hex: string
  /** Variante de badge shadcn aproximada */
  badge: string
}

const PALETTE: SubjectColor[] = [
  {
    tile: 'bg-blue-100 text-blue-700',
    solid: 'bg-blue-500',
    text: 'text-blue-700',
    hex: '#3b82f6',
    badge: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    tile: 'bg-purple-100 text-purple-700',
    solid: 'bg-purple-500',
    text: 'text-purple-700',
    hex: '#a855f7',
    badge: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    tile: 'bg-emerald-100 text-emerald-700',
    solid: 'bg-emerald-500',
    text: 'text-emerald-700',
    hex: '#10b981',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    tile: 'bg-amber-100 text-amber-700',
    solid: 'bg-amber-500',
    text: 'text-amber-700',
    hex: '#f59e0b',
    badge: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    tile: 'bg-rose-100 text-rose-700',
    solid: 'bg-rose-500',
    text: 'text-rose-700',
    hex: '#f43f5e',
    badge: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    tile: 'bg-cyan-100 text-cyan-700',
    solid: 'bg-cyan-500',
    text: 'text-cyan-700',
    hex: '#06b6d4',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  },
  {
    tile: 'bg-indigo-100 text-indigo-700',
    solid: 'bg-indigo-500',
    text: 'text-indigo-700',
    hex: '#6366f1',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    tile: 'bg-teal-100 text-teal-700',
    solid: 'bg-teal-500',
    text: 'text-teal-700',
    hex: '#14b8a6',
    badge: 'bg-teal-100 text-teal-800 border-teal-200'
  }
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0 // a 32 bits
  }
  return Math.abs(hash)
}

export function getSubjectColor(name: string): SubjectColor {
  if (!name) return PALETTE[0]
  return PALETTE[hashString(name) % PALETTE.length]
}
