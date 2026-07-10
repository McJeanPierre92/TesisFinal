'use client'

import { MyGrades } from '@/modules/academic/domain/academic'

const TERM_LABELS: Record<string, string> = {
  primerParcial: 'Primer Parcial',
  segundoParcial: 'Segundo Parcial',
  tercerParcial: 'Tercer Parcial',
  final: 'Final'
}

/**
 * Exporta las notas del alumno a un PDF usando jsPDF + autoTable.
 * Todo client-side, sin endpoint nuevo.
 */
export async function exportGradesToPDF(
  data: MyGrades,
  studentName: string
) {
  // Import dinámico para evitar cargar jsPDF si no se usa
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF()

  // Cabecera
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Reporte de Calificaciones', 14, 20)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Alumno: ${studentName}`, 14, 28)
  doc.text(
    `Fecha de generación: ${new Date().toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}`,
    14,
    34
  )

  // Promedio
  const gradedSubs = (data.submissions || []).filter((s) => s.grade)
  let promedio = '—'
  if (gradedSubs.length > 0) {
    const sum = gradedSubs.reduce(
      (acc, s) => acc + (s.grade!.score / s.task.maxScore) * 100,
      0
    )
    promedio = `${Math.round(sum / gradedSubs.length)}/100`
  }
  doc.text(`Promedio general: ${promedio}`, 14, 40)

  // Tabla 1: Notas de tareas
  const taskRows = gradedSubs.map((s) => [
    s.task.teachingAssignment.subject.name,
    s.task.title,
    `${s.grade!.score}/${s.task.maxScore}`
  ])

  autoTable(doc, {
    head: [['Materia', 'Tarea', 'Nota']],
    body: taskRows.length > 0 ? taskRows : [['—', 'Sin tareas calificadas', '—']],
    startY: 48,
    theme: 'striped',
    headStyles: { fillColor: [122, 45, 42] },
    styles: { fontSize: 9 }
  })

  // Tabla 2: Notas de parciales
  // @ts-ignore — autoTable añade lastAutoTable al doc
  const afterTable1Y = (doc as any).lastAutoTable?.finalY + 10 || 60

  const termRows = (data.termGrades || []).map((tg) => [
    tg.teachingAssignment.subject.name,
    TERM_LABELS[tg.term] || tg.term,
    String(tg.score)
  ])

  autoTable(doc, {
    head: [['Materia', 'Parcial', 'Nota']],
    body: termRows.length > 0 ? termRows : [['—', 'Sin parciales registrados', '—']],
    startY: afterTable1Y,
    theme: 'striped',
    headStyles: { fillColor: [122, 45, 42] },
    styles: { fontSize: 9 }
  })

  // Pie de página
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `ULEAM LMS — Reporte generado automáticamente — Página ${i}/${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    )
  }

  // Descargar
  const fileName = `notas_${studentName.replace(/\s+/g, '_').toLowerCase()}.pdf`
  doc.save(fileName)
}
