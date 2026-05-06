import { useAssignDeliveryToCourierMutation } from '@/api/deliveriesApi'
import { useGetCouriersQuery } from '@/api/couriersApi'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Icons,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '../../../admin-web-components'
import type { DeliveryAdminDto } from '../../../backend-admin-sdk'
import { DeliveryAdminDtoStatusEnum } from '../../../backend-admin-sdk'
import { useState } from 'react'

export function isDeliveryAwaitingCourierAssignment(delivery: DeliveryAdminDto): boolean {
  return (
    delivery.status === DeliveryAdminDtoStatusEnum.AssigningCourier && !delivery.courierId
  )
}

export function AssignCourierCell({ delivery }: { delivery: DeliveryAdminDto }) {
  const [open, setOpen] = useState(false)
  const [courierId, setCourierId] = useState<string>()
  const { toast } = useToast()
  const [assignCourier, { isLoading }] = useAssignDeliveryToCourierMutation()
  const { data: couriersResponse, isLoading: couriersLoading } = useGetCouriersQuery(
    { page: 1, perPage: 200 },
    { skip: !open },
  )

  const canAssign = isDeliveryAwaitingCourierAssignment(delivery)

  const handleAssign = async () => {
    if (!courierId) {
      toast({ title: 'Choose a courier', variant: 'destructive' })
      return
    }
    try {
      await assignCourier({ deliveryId: delivery.id, courierId }).unwrap()
      toast({ title: 'Courier assigned' })
      setOpen(false)
      setCourierId(undefined)
    } catch {
      toast({
        title: 'Assignment failed',
        description: 'Ensure the API accepts courierId on admin submit-event (opencourier-backend).',
        variant: 'destructive',
      })
    }
  }

  if (!canAssign) {
    return null
  }

  return (
    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setCourierId(undefined)
        }}
      >
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="shrink-0 whitespace-normal">
            Manually Reassign
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Assign courier</DialogTitle>
            <DialogDescription>
              Submits an admin ACCEPTED event with this courier for delivery{' '}
              <span className="font-mono text-xs">{delivery.id}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label>Courier</Label>
            <Select
              disabled={couriersLoading}
              value={courierId ?? ''}
              onValueChange={(v) => setCourierId(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={couriersLoading ? 'Loading…' : 'Select courier'} />
              </SelectTrigger>
              <SelectContent>
                {(couriersResponse?.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                    {c.phoneNumber ? ` · ${c.phoneNumber}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={isLoading || !courierId} onClick={() => void handleAssign()}>
              {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
              Manually Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
