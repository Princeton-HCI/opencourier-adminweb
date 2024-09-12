import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'
import { cn } from '../../../ui-shared-utils'

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} ref={ref} />
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

const RadioCardList = React.forwardRef<React.ElementRef<'ul'>, React.ComponentPropsWithoutRef<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-col gap-2', className)}>
      {props.children}
    </ul>
  )
)
RadioCardList.displayName = 'RadioCardList'

const RadioCardItem = React.forwardRef<React.ElementRef<'li'>, React.ComponentPropsWithoutRef<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)}>
      {props.children}
    </li>
  )
)
RadioCardItem.displayName = 'RadioCardItem'

const RadioCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, disabled, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      disabled={disabled}
      className={cn(
        'w-full py-8 px-6 flex justify-between gap-8 active:scale-95 transition-transform duration-150 ease-[cubic-bezier(0.2, 0, 0, 1)] cursor-pointer border-gray-100 rounded-xl border data-[state=checked]:border-gray-900',
        { 'cursor-not-allowed': disabled },
        className
      )}
      {...props}
    >
      {props.children}
    </RadioGroupPrimitive.Item>
  )
})
RadioCard.displayName = 'RadioCard'

export { RadioGroup, RadioGroupItem, RadioCardList, RadioCardItem, RadioCard }
