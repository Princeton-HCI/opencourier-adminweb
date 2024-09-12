import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { WithSheetCallbacks } from '../../../../admin-web-components'
import { MerchantAdminDto } from '../../../../backend-admin-sdk'
import { useAppDispatch } from '../../../../ui-shared-utils'
import { OrganizationSheetForm } from '../../components/OrganizationSheetForm'

export const CREATE_MERCHANT_SHEET_ID = 'create-merchant'
export const useUpdateOrganizationSheet = (
  args: { organizationId: string; groupId: string } & WithSheetCallbacks<MerchantAdminDto>
) => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(CREATE_MERCHANT_SHEET_ID))

  return {
    open: () =>
      dispatch(
        openSheet({
          id: CREATE_MERCHANT_SHEET_ID,
          children: <OrganizationSheetForm onSettled={close} {...args} />,
        })
      ),
    close,
  }
}
