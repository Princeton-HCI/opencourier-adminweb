import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { CatalogAdminDto, CatalogCategoryAdminDto } from '../../../../backend-admin-sdk'
import { useAppDispatch } from '../../../../ui-shared-utils'
import { CatalogSheetAddCategory } from '../../components/CatalogSheetAddCategory'

export const ADD_CATEGORY_SHEET_ID = 'add-category'
export const useAddCategorySheet = () => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(ADD_CATEGORY_SHEET_ID))

  return {
    open: (args: {
      catalog: CatalogAdminDto
      categories: CatalogCategoryAdminDto[]
      allCategories: CatalogCategoryAdminDto[]
    }) =>
      dispatch(
        openSheet({
          id: ADD_CATEGORY_SHEET_ID,
          children: <CatalogSheetAddCategory {...args} />,
        })
      ),
    close,
  }
}
