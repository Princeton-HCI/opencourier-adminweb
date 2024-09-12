import {
	InstanceConfigInput,
	InstanceConfigSettingsDto,
	InstanceConfigSettingsOptionsDto,
} from '../backend-admin-sdk'
import { Tags } from '@/api/utils/tags'
import { api as baseApi, prepareAdminSdk } from '.'
import { AppState } from '@/redux/store'
import { handleBackendError } from './utils/api'

export const configApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getInstanceConfig: build.query<InstanceConfigSettingsDto, any>({
      queryFn: async (_, api) => {
        try {
          const { accessToken } = (api.getState() as AppState).auth
          const sdk = prepareAdminSdk(accessToken || '')
					const data = await sdk.config().getInstanceConfig()
          return { data }
        } catch (error) {
          return {
            error: handleBackendError(error, api),
          }
        }
      },
      providesTags: [Tags.config],
    }),
    getInstanceConfigOptions: build.query<InstanceConfigSettingsOptionsDto, any>({
      queryFn: async (_, api) => {
        try {
          const { accessToken } = (api.getState() as AppState).auth
          const sdk = prepareAdminSdk(accessToken || '')
					const data = await sdk.config().getInstanceConfigOptions()
          return { data }
        } catch (error) {
          return {
            error: handleBackendError(error, api),
          }
        }
      },
      providesTags: [Tags.config],
    }),
    setInstanceConfig: build.mutation<InstanceConfigSettingsDto, InstanceConfigInput>({
      queryFn: async (instanceConfigSettingsAdminInput: InstanceConfigInput, api) => {
        try {
					if (!instanceConfigSettingsAdminInput) return { error: null }
          const { accessToken } = (api.getState() as AppState).auth
          const sdk = prepareAdminSdk(accessToken || '')
					const data = await sdk.config().setInstanceConfig({ instanceConfigSettingsAdminInput })
          return { data }
        } catch (error) {
          return {
            error: handleBackendError(error, api),
          }
        }
      },
			invalidatesTags: [Tags.config],
    }),
  }),
})

export const { useGetInstanceConfigQuery, useGetInstanceConfigOptionsQuery, useSetInstanceConfigMutation } = configApi
