import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { CatalogAdminDto } from '../../../../backend-admin-sdk'
import { useAppDispatch } from '../../../../ui-shared-utils'
import { CatalogSheetForm } from '../../components/CatalogSheetForm'

export const UPDATE_CATALOG_SHEET_ID = 'update-catalog'
export const useUpdateCatalogSheet = (args: { catalogId: string; defaultValues?: CatalogAdminDto }) => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(UPDATE_CATALOG_SHEET_ID))

  return {
    open: () =>
      dispatch(
        openSheet({
          id: UPDATE_CATALOG_SHEET_ID,
          children: <CatalogSheetForm mode="update" onSettled={close} {...args} />,
        })
      ),
    close,
  }
}
