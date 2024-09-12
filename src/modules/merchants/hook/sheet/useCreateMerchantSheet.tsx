import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { WithSheetCallbacks } from '../../../../admin-web-components'
import { MerchantAdminDto } from '../../../../backend-admin-sdk'
import { useAppDispatch } from '../../../../ui-shared-utils'
import { MerchantSheetForm } from '../../components/MerchantSheetForm'

export const CREATE_MERCHANT_SHEET_ID = 'create-merchant'
export const useCreateMerchantSheet = (args: WithSheetCallbacks<MerchantAdminDto>) => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(CREATE_MERCHANT_SHEET_ID))

  return {
    open: (organizationId: string) =>
      dispatch(
        openSheet({
          id: CREATE_MERCHANT_SHEET_ID,
          children: <MerchantSheetForm mode="create" onSettled={close} organizationId={organizationId} {...args} />,
        })
      ),
    close,
  }
}
