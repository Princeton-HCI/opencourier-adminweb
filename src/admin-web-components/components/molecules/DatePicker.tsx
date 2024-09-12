import dayjs from 'dayjs'
import { DayPickerBase, SelectSingleEventHandler } from 'react-day-picker'
import { cn } from '../../../ui-shared-utils'
import { Button } from '../atoms/Button'
import { Calendar } from '../atoms/Calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../atoms/Popover'

type DatePickerProps = Pick<DayPickerBase, 'fromDate' | 'toDate'> & {
  placeholder?: string
  value: Date | undefined
  onChange: SelectSingleEventHandler
}
export function DatePicker({ placeholder, value, onChange, ...props }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'outline'} className={cn('w-[120px] justify-start !m-0', { 'text-muted-foreground': !value })}>
          {value ? dayjs(value).format('MM/DD/YYYY') : <span>{placeholder ?? 'Pick a date'}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus {...props} />
      </PopoverContent>
    </Popover>
  )
}

export type { DateRange, SelectRangeEventHandler } from 'react-day-picker'
