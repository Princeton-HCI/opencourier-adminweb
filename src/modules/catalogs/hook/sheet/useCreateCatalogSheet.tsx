import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { MerchantAdminDto } from '../../../../backend-admin-sdk'
import { useAppDispatch } from '../../../../ui-shared-utils'
import { CatalogSheetForm } from '../../components/CatalogSheetForm'

export const CREATE_CATALOG_SHEET_ID = 'create-group'
export const useCreateCatalogSheet = (args: { merchant: MerchantAdminDto }) => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(CREATE_CATALOG_SHEET_ID))

  return {
    open: () =>
      dispatch(
        openSheet({
          id: CREATE_CATALOG_SHEET_ID,
          children: <CatalogSheetForm mode="create" onSettled={close} {...args} />,
        })
      ),
    close,
  }
}
