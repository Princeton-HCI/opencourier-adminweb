import { useUpdateCatalogScheduleMutation } from '@/api/catalogApi'
import { Button, SheetContent, SheetDescription, SheetHeader, SheetTitle, useToast } from '../../../admin-web-components'
import { CatalogAdminDto, CatalogScheduleAdminDto, CatalogTimeLapseUpsertAdminInput } from '../../../backend-admin-sdk'
import dayjs from 'dayjs'
import React from 'react'

interface ScheduleSheetLapseProps extends React.HTMLAttributes<HTMLDivElement> {
  catalog: CatalogAdminDto
  schedule: CatalogScheduleAdminDto
  timeLapse: CatalogTimeLapseUpsertAdminInput
  submitted?: () => void
}

export function ScheduleSheetLapse({ catalog, schedule, timeLapse, submitted }: ScheduleSheetLapseProps) {
  const [updateScheduleMutation] = useUpdateCatalogScheduleMutation()
  const { toast } = useToast()

  const open = dayjs().hour(timeLapse.open.hour).minute(timeLapse.open.minute)
  const close = dayjs().hour(timeLapse.close.hour).minute(timeLapse.close.minute)

  const handleDelete = async () => {
    if (!confirm(`Delete "${open.format('LT')} - ${close.format('LT')}" from "${schedule.day}"?`)) {
      return
    }

    try {
      const newLapses: CatalogTimeLapseUpsertAdminInput[] = schedule.lapses.filter((l) => l.id !== timeLapse.id)
      submitted && submitted()
      await updateScheduleMutation({
        catalogId: catalog.id,
        data: {
          day: schedule.day,
          enabled: schedule.enabled,
          lapses: newLapses,
        },
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Schedule edit failed',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      })
    }
  }

  const handleEnabled = async () => {
    try {
      submitted && submitted()
      await updateScheduleMutation({
        catalogId: catalog.id,
        data: {
          day: schedule.day,
          enabled: !schedule.enabled,
          lapses: schedule.lapses,
        },
      }).unwrap()
    } catch (error) {
      const newState = schedule.enabled ? 'disable' : 'enable'
      toast({
        title: 'Schedule toggle failed',
        description: `Failed to ${newState} schedule`,
        variant: 'destructive',
      })
    }
  }

  return (
    <SheetContent className="w-full">
      <SheetHeader>
        <SheetTitle>Time Slot Details</SheetTitle>
        <SheetDescription>
          <b>Schedule for {schedule.day}:</b> {schedule.enabled ? 'Open' : 'Closed'}
        </SheetDescription>
        <SheetDescription>
          <Button variant="outline" onClick={handleEnabled}>
            Set {schedule.enabled ? 'closed' : 'open'} for {schedule.day}
          </Button>
        </SheetDescription>
        <SheetDescription>
          <b>Time Lapse:</b> {open.format('LT')} - {close.format('LT')}
        </SheetDescription>
        <SheetDescription>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  )
}
