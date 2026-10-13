import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:font-sans",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-[#0B0D10] font-medium",
          cancelButton:
            "group-[.toast]:bg-elevated group-[.toast]:text-muted-foreground",
          error: "group-[.toast]:border-destructive/40 text-destructive",
          success: "group-[.toast]:border-success/40 text-success",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
