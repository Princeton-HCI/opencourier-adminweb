import dayjs from 'dayjs'

export const WEEKDAY_MAP = [0, 1, 2, 3, 4, 5, 6].reduce(
  (acc, cur) => ({
    ...acc,
    [dayjs().weekday(cur).format('dddd').toUpperCase()]: cur,
  }),
  {}
) as Record<CatalogScheduleAdminDtoDayEnum, number>
