'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * El índice /lms/admin quedó obsoleto: las 6 secciones de gestión académica
 * ahora se acceden directamente desde el sidebar. Esta página redirige al
 * dashboard para no romper enlaces antiguos.
 */
export default function AdminAcademicIndexPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/lms')
  }, [router])
  return null
}
