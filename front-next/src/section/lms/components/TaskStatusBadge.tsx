import { Badge } from '@/components/ui/badge'
import { SubmissionStatus } from '@/modules/academic/domain/academic'

const STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  pendiente: { label: 'Pendiente', variant: 'outline' },
  entregada: { label: 'Entregada', variant: 'secondary' },
  calificada: { label: 'Calificada', variant: 'default' }
}

export function TaskStatusBadge({ status }: { status: SubmissionStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pendiente
  return <Badge variant={config.variant}>{config.label}</Badge>
}
