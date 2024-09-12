import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { CatalogCategoryAdminDto, CatalogComputedAdminDto } from '../../../../backend-admin-sdk'
import { useAppDispatch } from '../../../../ui-shared-utils'
import { CategorySheetReorder } from '../../components/categories/CategorySheetReorder'

export const REORDER_CATEGORY_SHEET_ID = 'reorder-category'
export const useReorderCategorySheet = () => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(REORDER_CATEGORY_SHEET_ID))

  return {
    open: (args: { catalog: CatalogComputedAdminDto; categories: CatalogCategoryAdminDto[] }) =>
      dispatch(
        openSheet({
          id: REORDER_CATEGORY_SHEET_ID,
          children: <CategorySheetReorder onSettled={close} {...args} />,
        })
      ),
    close,
  }
}
