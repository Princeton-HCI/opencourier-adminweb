import { Plus } from 'lucide-react'
import { ReactNode } from 'react'
import { Button } from '../atoms/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../molecules/Card'

type GroupCardUsersProps = {
  children: ReactNode
  onNewUser: () => void
}

export function GroupCardUsers({ children, onNewUser }: GroupCardUsersProps) {
  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle></CardTitle>
        <CardTitle className="flex flex-row place-content-between items-center">
          <div className="grow text-base md:text-xl">Users</div>
          <div className="grow-0 space-x-2 flex flex-col md:flex-row items-end">
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={onNewUser}>
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 overflow-scroll scrollbar-hide">{children}</CardContent>
    </Card>
  )
}
