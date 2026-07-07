import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { ReactNode } from 'react'

type DrawerDialogProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string | ReactNode
  footer?: ReactNode
  children?: ReactNode
}

export const DrawerDialog = (props: DrawerDialogProps) => {
  return (
    <Sheet open={props.isOpen} onOpenChange={props.onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{props.title}</SheetTitle>
          <SheetDescription>{props.description}</SheetDescription>
        </SheetHeader>
        <div className='grid flex-1 auto-rows-min gap-6 px-4'>
          {props.children}
        </div>
        <SheetFooter>{props.footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
