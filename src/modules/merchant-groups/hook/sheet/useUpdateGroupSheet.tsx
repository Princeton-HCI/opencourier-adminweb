import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { WithSheetCallbacks } from '../../../../admin-web-components'
import { MerchantGroupAdminDto } from '../../../../backend-admin-sdk'
import { useAppDispatch } from '../../../../ui-shared-utils'
import { GroupSheetForm } from '../../components/GroupSheetForm'

export const UPDATE_GROUP_SHEET_ID = 'update-group'
export const useUpdateGroupSheet = (
  args: { groupId: string; defaultValues?: MerchantGroupAdminDto } & WithSheetCallbacks<MerchantGroupAdminDto>
) => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(UPDATE_GROUP_SHEET_ID))

  return {
    open: () =>
      dispatch(
        openSheet({
          id: UPDATE_GROUP_SHEET_ID,
          children: <GroupSheetForm mode="update" onSettled={close} {...args} />,
        })
      ),
    close,
  }
}
