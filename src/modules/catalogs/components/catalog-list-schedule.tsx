import { useUpdateCatalogScheduleMutation } from '../../../api/catalogApi';
import { ScheduleSheetLapse } from '@/modules/catalogs/components/schedule/schedule-sheet-lapse'
import { Button, Sheet, useToast } from '../../../admin-web-components'
import {
  CatalogAdminDto,
  CatalogScheduleAdminDto,
  CatalogTimeLapseAdminDto,
  CatalogTimeLapseUpsertAdminInput,
  MerchantAdminDto,
  CatalogScheduleAdminDtoDayEnum,
} from '../../../backend-admin-sdk'
import { useScreenSize } from '../../../ui-shared-utils'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Calendar, CalendarProps, Event, dayjsLocalizer } from 'react-big-calendar'
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop'
import { WEEKDAY_MAP } from '@/constants'

interface CatalogScheduleProps {
  catalog: CatalogAdminDto
  merchant: MerchantAdminDto
  schedule: CatalogScheduleAdminDto[]
}

export function CatalogListSchedule({ catalog, merchant, schedule }: CatalogScheduleProps) {
  const [selectedLapse, setSelectedLapse] = React.useState<{
    schedule: CatalogScheduleAdminDto
    lapse: CatalogTimeLapseAdminDto
  } | null>(null)
  const [weekSchedule, setWeekSchedule] = React.useState<Record<string, CatalogScheduleAdminDto>>({})
  const [events, setEvents] = React.useState<Event[]>([])
  const [updateScheduleMutation] = useUpdateCatalogScheduleMutation()

  const [selectedDate, setSelectedDate] = useState<Date>(dayjs().startOf('day').toDate())
  const [selectedView, setSelectedView] = useState<'week' | 'day'>('week')

  const screenSize = useScreenSize()
  const { toast } = useToast()

  useEffect(() => {
    if (selectedView === 'week' && screenSize.width < 768) {
      setSelectedView('day')
    }
    if (selectedView === 'day' && screenSize.width >= 768) {
      setSelectedView('week')
    }
  }, [screenSize])

  useEffect(() => {
    const newWeekSchedule: Record<string, CatalogScheduleAdminDto> = {}
    const newEvents: Event[] = []

    schedule.forEach((s) => {
      const date = dayjs().weekday(WEEKDAY_MAP[s.day])
      newWeekSchedule[s.day] = s
      s.lapses.forEach((l) => {
        newEvents.push({
          start: date.clone().hour(l.open.hour).minute(l.open.minute).toDate(),
          end: date.clone().hour(l.close.hour).minute(l.close.minute).toDate(),
          resource: { schedule: s, lapse: l },
        })
      })
    })

    setWeekSchedule(newWeekSchedule)
    setEvents(newEvents)
  }, [schedule])

  const handleUpdateSchedule = async (
    dailySchedule: CatalogScheduleAdminDto,
    newLapses: CatalogTimeLapseUpsertAdminInput[]
  ) => {
    try {
      setEvents([])
      await updateScheduleMutation({
        catalogId: catalog.id,
        data: {
          day: dailySchedule.day,
          enabled: dailySchedule.enabled,
          lapses: newLapses,
        },
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Schedule update failed',
        description: 'Failed to update schedule',
        variant: 'destructive',
      })
    }
  }

  const onEventDrop: withDragAndDropProps['onEventDrop'] = async (data) => {
    const dailySchedule: CatalogScheduleAdminDto = data.event.resource.schedule
    const open = dayjs(data.start)
    const close = dayjs(data.end)
    const weekday = open.format('dddd').toUpperCase()

    // Allow only actions in the same column
    if (dailySchedule.day !== weekday) {
      return
    }

    const lapseId = data.event.resource.lapse.id
    const newLapses: CatalogTimeLapseUpsertAdminInput[] = [
      ...dailySchedule.lapses.filter((l) => l.id !== lapseId),
      {
        id: lapseId,
        open: {
          hour: open.get('hour'),
          minute: open.get('minute'),
        },
        close: {
          hour: close.get('hour'),
          minute: close.get('minute'),
        },
      },
    ]
    await handleUpdateSchedule(dailySchedule, newLapses)
  }

  const onEventResize: withDragAndDropProps['onEventResize'] = async (data) => {
    const dailySchedule: CatalogScheduleAdminDto = data.event.resource.schedule
    const open = dayjs(data.start)
    const close = dayjs(data.end)
    const weekday = open.format('dddd').toUpperCase()

    // Allow only actions in the same column
    if (dailySchedule.day !== weekday) {
      return
    }

    const lapseId = data.event.resource.lapse.id
    const newLapses: CatalogTimeLapseUpsertAdminInput[] = [
      ...dailySchedule.lapses.filter((l) => l.id !== lapseId),
      {
        id: lapseId,
        open: {
          hour: open.get('hour'),
          minute: open.get('minute'),
        },
        close: {
          hour: close.get('hour'),
          minute: close.get('minute'),
        },
      },
    ]
    await handleUpdateSchedule(dailySchedule, newLapses)
  }

  const onSelectSlot: CalendarProps['onSelectSlot'] = async (slot) => {
    if (slot.action !== 'select') {
      return
    }

    const open = dayjs(slot.start)
    const close = dayjs(slot.end)
    const weekday = open.format('dddd').toUpperCase() as CatalogScheduleAdminDtoDayEnum
    const dailySchedule = weekSchedule[weekday] ?? { day: weekday, enabled: false, lapses: [] }
    const newLapses: CatalogTimeLapseUpsertAdminInput[] = [
      ...dailySchedule.lapses,
      {
        open: {
          hour: open.get('hour'),
          minute: open.get('minute'),
        },
        close: {
          hour: close.get('hour'),
          minute: close.get('minute'),
        },
      },
    ]
    await handleUpdateSchedule(dailySchedule, newLapses)
  }

  const DnDCalendar = withDragAndDrop(Calendar)
  const localizer = dayjsLocalizer(dayjs)
  const startOfWeek = dayjs().startOf('week')
  const endOfWeek = dayjs().endOf('week')

  return (
    <div style={{ height: 1000 }}>
      <DnDCalendar
        className="mt-4 rbc__allday-hide"
        localizer={localizer}
        longPressThreshold={10}
        view={selectedView}
        views={[selectedView]}
        events={events}
        date={selectedDate}
        step={15}
        onView={() => {}}
        onNavigate={(date) => {
          if (dayjs(date).isBefore(startOfWeek)) {
            setSelectedDate(startOfWeek.toDate())
          } else if (dayjs(date).isAfter(endOfWeek)) {
            setSelectedDate(endOfWeek.toDate())
          } else {
            setSelectedDate(dayjs(date).toDate())
          }
        }}
        draggableAccessor={() => merchant.menuProvider === 'NOSH'}
        resizableAccessor={() => merchant.menuProvider === 'NOSH'}
        selectable={merchant.menuProvider === 'NOSH'}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        onSelectSlot={onSelectSlot}
        onSelectEvent={(event: Event) => {
          if (merchant.menuProvider !== 'NOSH') {
            return
          }
          setSelectedLapse(event.resource)
        }}
        components={{
          toolbar: () => (
            <>
              {selectedView === 'day' ? (
                <div className="mb-4 flex flex-row justify-between">
                  <Button
                    variant="outline"
                    disabled={dayjs(selectedDate).isSame(startOfWeek, 'day')}
                    onClick={() => {
                      const prevDate = dayjs(selectedDate).subtract(1, 'day')
                      if (!prevDate.isBefore(startOfWeek)) {
                        setSelectedDate(prevDate.toDate())
                      }
                    }}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    disabled={dayjs(selectedDate).isSame(endOfWeek, 'day')}
                    onClick={() => {
                      const nextDate = dayjs(selectedDate).add(1, 'day')
                      if (!nextDate.isAfter(endOfWeek)) {
                        setSelectedDate(nextDate.toDate())
                      }
                    }}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              ) : null}
            </>
          ),
          week: {
            header: (props) => {
              const weekday = props.localizer.format(props.date, 'dddd')
              return <>{weekday}</>
            },
          },
          day: {
            header: (props) => {
              const weekday = props.localizer.format(props.date, 'dddd')
              return <>{weekday}</>
            },
          },
          timeGutterHeader: () => <div className="min-w-[69px] max-w-[69px]" />,
        }}
        eventPropGetter={(event: Event) => {
          return { style: { backgroundColor: event.resource?.schedule?.enabled ? '' : '#666' } }
        }}
      />
      {selectedLapse ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setSelectedLapse(null)}>
          <ScheduleSheetLapse
            catalog={catalog}
            schedule={selectedLapse.schedule}
            timeLapse={selectedLapse.lapse}
            submitted={() => setSelectedLapse(null)}
          ></ScheduleSheetLapse>
        </Sheet>
      ) : null}
    </div>
  )
}
