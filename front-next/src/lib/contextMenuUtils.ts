import { toast } from 'sonner'
import { utils, writeFile } from 'xlsx'

export function exportTableToExcel(
  tableElement: HTMLElement,
  fileName = 'tabla.xlsx'
) {
  const workbook = utils.table_to_book(tableElement, { sheet: 'Datos' })
  writeFile(workbook, fileName)
}

export const copyTableContent = async (table: HTMLElement) => {
  if (!table) {
    alert('No se encontró la tabla.')
    return false
  }

  const range = document.createRange()
  range.selectNode(table)
  const selection = window.getSelection()

  if (!selection) return

  selection.removeAllRanges()
  selection.addRange(range)

  try {
    document.execCommand('copy')
    toast.success('Tabla copiada exitosamente')
  } catch (err) {
    console.error('Error al copiar la tabla', err)
    toast.error('Error al copiar la tabla')
  }

  selection.removeAllRanges()
}
