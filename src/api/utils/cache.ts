import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit'
import { DeliveryAdminDtoFromJSON, DeliveryAdminDto } from '../../backend-admin-sdk'

export const handleDeliveryStatusUpdateEvent = (data: DeliveryAdminDto, dispatch: ThunkDispatch<any, any, AnyAction>) => {
  const updatedDelivery = DeliveryAdminDtoFromJSON(data)

  // if (ACTIVE_STATUSES.includes(data.status)) {
  //   return dispatch(
  //     deliveriesApi.util.updateQueryData('getDelivery', { view: 'ACTIVE' }, (draft) => {
  //       const existingDeliveryIndex = draft.data.findIndex((delivery) => delivery.id === data.id)
  //       if (existingDeliveryIndex === -1) {
  //         draft.data.push(updatedDelivery)
  //       } else {
  //         draft.data[existingDeliveryIndex] = updatedDelivery
  //       }
  //       return draft
  //     })
  //   )
  // }

  // if (NOT_ACTIVE_STATUSES.includes(data.status)) {
  //   return dispatch(
  //     deliveriesApi.util.updateQueryData('getDelivery', { view: 'RECENT' }, (draft) => {
  //       const existingDeliveryIndex = draft.data.findIndex((delivery) => delivery.id === data.id)
  //       if (existingDeliveryIndex !== -1) {
  //         draft.data[existingDeliveryIndex] = updatedDelivery
  //       }
  //       return draft
  //     })
  //   )
  // }
}
