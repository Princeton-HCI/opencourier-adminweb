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
    submitDeliveryEvent: build.mutation<
      DeliveryAdminDto,
      { deliveryId: string; eventType: EnumDeliveryEventType; courierId?: string }
    >({
      queryFn: async ({ deliveryId, eventType, courierId }, api) => {
        try {
          const { accessToken } = (api.getState() as AppState).auth
          const sdk = prepareAdminSdk(accessToken || '')
          const data = await sdk.deliveries().submitOrderEvent({
            id: deliveryId,
            deliverySubmitEventAdminInput: {
              deliveryId,
              eventType,
              ...(courierId ? { courierId } : {}),
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
    /** Manual assign: admin ACCEPTED with courierId (opencourier-backend POST /api/admin/v1/deliveries/:id/submit-event). */
    assignDeliveryToCourier: build.mutation<
      DeliveryAdminDto,
      { deliveryId: string; courierId: string }
    >({
      queryFn: async ({ deliveryId, courierId }, api) => {
        try {
          const { accessToken } = (api.getState() as AppState).auth
          const sdk = prepareAdminSdk(accessToken || '')
          const data = await sdk.deliveries().submitOrderEvent({
            id: deliveryId,
            deliverySubmitEventAdminInput: {
              deliveryId,
              eventType: EnumDeliveryEventType.ACCEPTED,
              courierId,
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

export const {
  useGetDeliveriesQuery,
  useGetDeliveryQuery,
  useSubmitDeliveryEventMutation,
  useAssignDeliveryToCourierMutation,
} = deliveriesApi
