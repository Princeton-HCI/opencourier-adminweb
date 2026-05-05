import type { CourierPaginatedAdminDto } from '../backend-admin-sdk'
import { Tags } from '@/api/utils/tags'
import { api as baseApi, prepareAdminSdk } from '.'
import { AppState } from '@/redux/store'
import { handleBackendError } from './utils/api'

export const couriersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getCouriers: build.query<
      CourierPaginatedAdminDto,
      { page?: number; perPage?: number }
    >({
      queryFn: async (params, api) => {
        try {
          const { accessToken } = (api.getState() as AppState).auth
          const sdk = prepareAdminSdk(accessToken || '')
          const data = await sdk.couriers().getManyCouriers({
            page: params.page ?? 1,
            perPage: params.perPage ?? 100,
          })
          return { data }
        } catch (error) {
          return {
            error: handleBackendError(error, api),
          }
        }
      },
      providesTags: [Tags.couriers],
    }),
  }),
})

export const { useGetCouriersQuery } = couriersApi
