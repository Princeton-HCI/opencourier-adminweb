'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import type { TabsProps } from '@radix-ui/react-tabs'
import { cn } from '../../../ui-shared-utils'
import { Separator } from '../atoms/Separator'

const Tabs = ({ children, ...props }: TabsProps) => (
  <TabsPrimitive.Root {...props}>
    {children}
    <Separator />
  </TabsPrimitive.Root>
)

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => <TabsPrimitive.List ref={ref} className={cn(className)} {...props} />)
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    style={{ minBlockSize: 36 }}
    className={cn(
      'min-w-fit bg-background rounded-md py-0 px-[10px] m-0 whitespace-nowrap relative hover:bg-gray-50 after:hidden after:m-0  after:content-empty after:h-1 after:left-[10px] after:w-[calc(100%-20px)] after:absolute after:-bottom-[1px] data-[state=active]:after:block  data-[state=active]:after:bg-gray-950 first:-ml-[10px]',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
