import { BaseQueryApi } from '@reduxjs/toolkit/query'
import { authApi } from '../authApi'
import { setAccessToken } from '@/modules/auth/slices/authSlice'

export const handleBackendError = (error: any, api: BaseQueryApi) => {
  if (error.statusCode === 401) {
    api.dispatch(setAccessToken(null))
    api.dispatch(authApi.util.resetApiState())
  }
  return error
}
