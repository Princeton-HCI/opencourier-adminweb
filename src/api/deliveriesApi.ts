import {
  DeliveryAdminDto,
  DeliveryAdminPaginatedDto,
} from '../backend-admin-sdk'
import { Tags } from '@/api/utils/tags'
import { api as baseApi, prepareAdminSdk } from '.'
import { AppState } from '@/redux/store'
import { EnumDeliveryEventType } from '../shared-types'
import { handleBackendError } from './utils/api'

export const deliveriesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getDeliveries: build.query<DeliveryAdminPaginatedDto, any>({
      queryFn: async (params, api) => {
        try {
          const { accessToken } = (api.getState() as AppState).auth
          const sdk = prepareAdminSdk(accessToken || '')
          const data = await sdk.deliveries().getDeliveries(params)
          return { data }
        } catch (error) {
          return {
            error: handleBackendError(error, api),
          }
        }
      },
      providesTags: [Tags.deliveries],
    }),
    getDelivery: build.query<DeliveryAdminDto, { id: string }>({
      queryFn: async ({ id }, api) => {
        try {
          if (!id) return { error: null }
          const { accessToken } = (api.getState() as AppState).auth
          const sdk = prepareAdminSdk(accessToken || '')
          const data = await sdk.deliveries().getDelivery({ deliveryId: id })
          return { data }
        } catch (error) {
          return {
            error: handleBackendError(error, api),
          }
        }
      },
      providesTags: [Tags.deliveries],
    }),
    submitDeliveryEvent: build.mutation<DeliveryAdminDto, { deliveryId: string; eventType: EnumDeliveryEventType }>({
      queryFn: async ({ deliveryId, eventType }, api) => {
        try {
          const { accessToken } = (api.getState() as AppState).auth
          const sdk = prepareAdminSdk(accessToken || '')
          const data = await sdk.deliveries().submitOrderEvent({
            id: deliveryId,
            deliverySubmitEventAdminInput: {
              deliveryId,
              eventType,
            },
          })
          return { data }
        } catch (error) {
          return {
            error: handleBackendError(error, api),
          }
        }
      },
      invalidatesTags: [Tags.deliveries],
    }),
  }),
})

export const { useGetDeliveriesQuery, useGetDeliveryQuery, useSubmitDeliveryEventMutation } = deliveriesApi
