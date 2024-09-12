import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { WithSheetCallbacks } from '../../../../admin-web-components'
import { MerchantGroupAdminDto } from '../../../../backend-admin-sdk'
import { useAppDispatch } from '../../../../ui-shared-utils'
import { GroupSheetForm } from '../../components/GroupSheetForm'

export const CREATE_GROUP_SHEET_ID = 'create-group'
export const useCreateGroupSheet = (args?: WithSheetCallbacks<MerchantGroupAdminDto>) => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(CREATE_GROUP_SHEET_ID))

  return {
    open: () =>
      dispatch(
        openSheet({
          id: CREATE_GROUP_SHEET_ID,
          children: <GroupSheetForm mode="create" onSettled={close} {...(args ?? {})} />,
        })
      ),
    close,
  }
}
