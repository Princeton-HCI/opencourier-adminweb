import { cn } from '../ui-shared-utils';
import React from 'react'

export type StatusIndicatorProps = {
  title?: string
  variant: 'primary' | 'danger' | 'warning' | 'success' | 'active' | 'default'
} & React.HTMLAttributes<HTMLDivElement>

export function StatusIndicator({ title, variant = 'success', className, ...props }: StatusIndicatorProps) {
  const dotClass = cn({
    'bg-teal-500': variant === 'success',
    'bg-rose-500': variant === 'danger',
    'bg-yellow-500': variant === 'warning',
    'bg-violet-600': variant === 'primary',
    'bg-emerald-400': variant === 'active',
    'bg-gray-400': variant === 'default',
  })
  return (
    <div
      className={cn('font-normal flex items-center', className, {
        'hover:bg-gray-5 cursor-pointer': !!props.onClick,
      })}
      {...props}
    >
      <div className={cn('h-1.5 w-1.5 self-center rounded-full', dotClass)} />
      {title && <span className="ml-2">{title}</span>}
    </div>
  )
}
