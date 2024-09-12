import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { SheetContent } from '../../../../admin-web-components'
import { useAppDispatch } from '../../../../ui-shared-utils'
import { DeliveryDetails } from '../../components/DeliveryDetails'

export const DELIVERY_DETAIL_SHEET_ID = 'delivery-detail'
export const useDeliveryDetailsSheet = () => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(DELIVERY_DETAIL_SHEET_ID))

  return {
    open: (args: { deliveryId: string }) =>
      dispatch(
        openSheet({
          id: DELIVERY_DETAIL_SHEET_ID,
          children: (
            <SheetContent className="w-full md:w-[700px] sm:max-w-full">
              <DeliveryDetails {...args} isSheet />
            </SheetContent>
          ),
        })
      ),
    close,
  }
}
