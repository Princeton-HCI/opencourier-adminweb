import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { WithSheetCallbacks } from '../../../../admin-web-components'
import { MerchantGroupAdminDto } from '../../../../backend-admin-sdk'
import { useAppDispatch } from '../../../../ui-shared-utils'
import { CustomGroupSheetForm } from '../../components/CustomGroupSheetForm'

export const CREATE_CUSTOM_GROUP_SHEET_ID = 'create-custom-group'
export const useCreateCustomGroupSheet = (args?: WithSheetCallbacks<MerchantGroupAdminDto>) => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(CREATE_CUSTOM_GROUP_SHEET_ID))

  return {
    open: () =>
      dispatch(
        openSheet({
          id: CREATE_CUSTOM_GROUP_SHEET_ID,
          children: <CustomGroupSheetForm mode="create" onSettled={close} {...(args ?? {})} />,
        })
      ),
    close,
  }
}
