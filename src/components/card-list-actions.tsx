'use client'
import { Button } from '../admin-web-components'
import { MoreVertical } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../admin-web-components'

interface Props {
  children: React.ReactNode
}

export function CardListActions(props: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <MoreVertical className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {props.children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
