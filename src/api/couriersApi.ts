import type { CourierAdminDto, CourierPaginatedAdminDto } from '../backend-admin-sdk'
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
    /** Fetches every page so admin pickers (e.g. manual assign) are not capped at `perPage`. */
    getAllCouriers: build.query<CourierAdminDto[], void>({
      queryFn: async (_, api) => {
        try {
          const { accessToken } = (api.getState() as AppState).auth
          const sdk = prepareAdminSdk(accessToken || '')
          const perPage = 100
          const first = await sdk.couriers().getManyCouriers({ page: 1, perPage })
          const all: CourierAdminDto[] = [...first.data]
          const totalPages = first.pagination?.totalPages ?? 1
          for (let page = 2; page <= totalPages; page++) {
            const res = await sdk.couriers().getManyCouriers({ page, perPage })
            all.push(...res.data)
          }
          return { data: all }
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

export const { useGetCouriersQuery, useGetAllCouriersQuery } = couriersApi
