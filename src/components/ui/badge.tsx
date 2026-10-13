import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-primary select-none capitalize",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-[#0B0D10] font-semibold",
        secondary:
          "border-border bg-elevated text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/15 text-destructive border border-destructive/30",
        outline:
          "border-border text-muted-foreground",
        teal:
          "border-transparent bg-accent text-[#0B0D10] font-semibold",
        amber:
          "border-amber-500/30 bg-amber-500/10 text-amber-400",
        green:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        limeOutline:
          "border-primary/40 bg-primary/10 text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  priority?: string;
  status?: string;
}

function getPriorityVariant(priority: string): NonNullable<VariantProps<typeof badgeVariants>['variant']> {
  switch (priority) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'amber';
    case 'medium':
      return 'limeOutline';
    case 'low':
    default:
      return 'secondary';
  }
}

function getStatusVariant(status: string): NonNullable<VariantProps<typeof badgeVariants>['variant']> {
  switch (status) {
    case 'completed':
      return 'green';
    case 'in_progress':
      return 'teal';
    case 'paused':
    case 'on_hold':
      return 'amber';
    case 'planned':
    case 'not_started':
    default:
      return 'secondary';
  }
}

function Badge({ className, variant, priority, status, children, ...props }: BadgeProps) {
  let resolvedVariant = variant;
  let content = children;

  if (priority && !variant) {
    resolvedVariant = getPriorityVariant(priority);
    if (!content) {
      content = priority;
    }
  } else if (status && !variant) {
    resolvedVariant = getStatusVariant(status);
    if (!content) {
      content = status.replace(/_/g, ' ');
    }
  }

  return (
    <div className={cn(badgeVariants({ variant: resolvedVariant }), className)} {...props}>
      {content}
    </div>
  );
}

export { Badge, badgeVariants }
