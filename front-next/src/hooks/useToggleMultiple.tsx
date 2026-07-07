import { useState } from 'react'

export const useToggleMultiple = () => {
  const [manual, setManual] = useState<Record<number, boolean>>({})

  const toggleManual = (index: number) => {
    setManual((prev) => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const toggleManualValue = (index: number, value: boolean) => {
    setManual((prev) => ({
      ...prev,
      [index]: value
    }))
  }

  return { manual, toggleManual, toggleManualValue }
}
