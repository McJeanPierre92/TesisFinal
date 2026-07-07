import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ReactNode } from 'react'

type ModalDialogProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string | ReactNode
  footer?: ReactNode
  children?: ReactNode
  className?: string
}

export const ModalDialog: React.FC<ModalDialogProps> = (props) => {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent className={props.className || 'sm:max-w-md w-full'}>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
        </DialogHeader>
        {props.description}
        {props.children}
        <DialogFooter>{props.footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
