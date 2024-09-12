import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { MerchantAdminDto } from '../../../../backend-admin-sdk'
import { useAppDispatch } from '../../../../ui-shared-utils'
import { MerchantSheetForm } from '../../components/MerchantSheetForm'
import { WithSheetCallbacks } from '../../../../admin-web-components'

export const UPDATE_MERCHANT_SHEET_ID = 'update-merchant'
export const useUpdateMerchantSheet = (
  args: { merchantId: string; defaultValues?: MerchantAdminDto } & WithSheetCallbacks<MerchantAdminDto>
) => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(UPDATE_MERCHANT_SHEET_ID))

  return {
    open: () =>
      dispatch(
        openSheet({
          id: UPDATE_MERCHANT_SHEET_ID,
          children: <MerchantSheetForm mode="update" onSettled={close} {...args} />,
        })
      ),
    close,
  }
}
