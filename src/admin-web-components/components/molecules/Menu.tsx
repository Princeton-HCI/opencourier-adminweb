import { cn } from '../../../ui-shared-utils'
import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'
import { Button } from '../atoms/Button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './DropdownMenu'

const Menu = DropdownMenu

const MenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuTrigger>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuTrigger ref={ref} {...props} asChild>
    <Button variant="outline" className={cn('w-[200px] justify-between', className)}>
      {children}
      <ChevronDownIcon className="w-4 h-4" />
    </Button>
  </DropdownMenuTrigger>
))

const MenuItems = React.forwardRef<
  React.ElementRef<typeof DropdownMenuContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuContent ref={ref} align="end" className={cn('w-[200px]', className)} {...props} />
))

const MenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem>
>(({ className, ...props }, ref) => (
  <DropdownMenuItem
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  />
))

export { Menu, MenuItem, MenuItems, MenuTrigger }
