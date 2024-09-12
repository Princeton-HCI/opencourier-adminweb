import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Tags } from '@/api/utils/tags'
import { ApiError, BackendAdminSdk } from '../backend-admin-sdk'

export const api = createApi({
  reducerPath: 'api',
  // @ts-expect-error Issue with the RTK types
  baseQuery: fetchBaseQuery() as BaseQueryFn<string | FetchArgs, unknown, ApiError>,
  tagTypes: Tags.tagTypes,
  endpoints: () => ({}),
})

export const prepareAdminSdk = (accessToken: string) => {
  const settings = {
    API_URL: process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '') ?? '',
  }
  return new BackendAdminSdk({
    basePath: settings.API_URL,
    accessToken: () => accessToken,
  })
}
