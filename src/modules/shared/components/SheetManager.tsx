import { Sheet } from '../../../admin-web-components'
import { useAppDispatch } from '../../../ui-shared-utils'
import { useSelector } from 'react-redux'
import { closeSheet, selectSheets } from '../slices/sheetManagerSlice'

/** Inspired by mantine modal manager. See https://mantine.dev/others/modals/ for reference */
export function SheetsManager() {
  const sheets = useSelector(selectSheets)
  const dispatch = useAppDispatch()

  return sheets.map((sheet) => (
    <Sheet key={sheet.id} open={true} onOpenChange={(isOpen) => !isOpen && dispatch(closeSheet(sheet.id))}>
      {sheet.children}
    </Sheet>
  ))
}
