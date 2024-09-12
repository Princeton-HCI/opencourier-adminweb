import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../admin-web-components';
import { cn } from '../ui-shared-utils';
import { LucideIcon, MoreHorizontal } from 'lucide-react'

export type Action = {
  label: string
  onClick: () => void
  variant?: 'normal' | 'danger'
  disabled?: boolean
  icon?: LucideIcon
}

type ActionsProps = {
  actions: Action[]
}

export function Actions(props: ActionsProps) {
  const { actions } = props
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map(({ icon: Icon, variant = 'normal', ...action }) => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.onClick}
            className={cn({ 'text-red-500': variant === 'danger' })}
          >
            {Icon ? <Icon size={16} className="mr-2" /> : null} {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
