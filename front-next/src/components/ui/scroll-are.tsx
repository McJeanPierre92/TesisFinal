import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} {...props}>
    <ScrollAreaPrimitive.Viewport>
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar orientation="vertical" />
    <ScrollAreaPrimitive.Scrollbar orientation="horizontal" />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = "ScrollArea"