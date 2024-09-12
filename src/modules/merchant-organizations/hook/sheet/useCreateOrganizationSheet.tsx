import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { WithSheetCallbacks } from '../../../../admin-web-components'
import { MerchantOrganizationAdminDto } from '../../../../backend-admin-sdk'
import { useAppDispatch } from '../../../../ui-shared-utils'
import { OrganizationSheetForm } from '../../components/OrganizationSheetForm'

export const CREATE_ORGANIZATION_SHEET_ID = 'create-organization'
export const useCreateOrganizationSheet = (
  args: { groupId: string } & WithSheetCallbacks<MerchantOrganizationAdminDto>
) => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(CREATE_ORGANIZATION_SHEET_ID))

  return {
    open: () =>
      dispatch(
        openSheet({
          id: CREATE_ORGANIZATION_SHEET_ID,
          children: <OrganizationSheetForm submitted={close} onSettled={close} {...args} />,
        })
      ),
    close,
  }
}
