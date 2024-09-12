import { BaseAPI, Configuration, ConfigurationParameters } from './runtime'
import { AuthApi, ConfigApi, CourierApi, CourierSettingsApi, DeliveriesApi, LocationsApi } from "./apis";
import { ApiError } from './errors'

export class BackendAdminSdk {
  private apis: { [name: string]: BaseAPI } = {}
  private readonly params: ConfigurationParameters
  private readonly configuration: Configuration

  constructor(params: ConfigurationParameters) {
    this.params = {
      ...params,
      middleware: [
        ...(params.middleware || []),
        {
          onError: async (ctx) => {
            if (ctx.response) {
              const body = await ctx.response.json()
              if (typeof body === 'object' && body !== null && body.error && body.result) {
                if (Array.isArray(body.result)) {
                  throw this.convertApiError(body.result[0])
                }
                throw this.convertApiError(body.result)
              }
              if (ctx.response.status === 401) {
                throw new ApiError('UNAUTHORIZED', 'Unauthorized', 401)
              }
              if (ctx.response.status === 403) {
                throw new ApiError('FORBIDDEN', 'Forbidden', 401)
              }
            }
          },
          post: async (ctx) => {
            if (ctx.response.status !== 204) {
              if (!ctx.response.headers.get('Content-Type')?.includes('application/json')) {
                return new Response(JSON.stringify({}), ctx.init)
              }
              const body = await ctx.response.json()
              if (typeof body === 'object' && body !== null) {
                if (body.error && body.result) {
                  if (Array.isArray(body.result)) {
                    throw this.convertApiError(body.result[0])
                  }
                  throw this.convertApiError(body.result)
                }
                if (ctx.response.status === 401) {
                  throw new ApiError('UNAUTHORIZED', 'Unauthorized', 401)
                }
                if (ctx.response.status === 403) {
                  throw new ApiError('FORBIDDEN', 'Forbidden', 401)
                }
                if (body.result) {
                  return new Response(JSON.stringify(body.result), ctx.init)
                }
              }
            }
          },
        },
      ],
    }
    this.configuration = new Configuration(this.params)
  }

  auth(): AuthApi {
    return this.getOrCreateApi(AuthApi)
  }

  deliveries(): DeliveriesApi {
    return this.getOrCreateApi(DeliveriesApi)
  }

  couriers(): CourierApi {
    return this.getOrCreateApi(CourierApi)
  }

  courierSettings(): CourierSettingsApi {
    return this.getOrCreateApi(CourierSettingsApi)
  }

  locations(): LocationsApi {
    return this.getOrCreateApi(LocationsApi)
  }

  config(): ConfigApi {
    return this.getOrCreateApi(ConfigApi)
  }

  private getOrCreateApi<T extends BaseAPI>(apiClass: { new (config: Configuration): T }): T {
    if (!this.apis[apiClass.name]) {
      this.apis[apiClass.name] = new apiClass(this.configuration)
    }
    return this.apis[apiClass.name] as T
  }

  private convertApiError(errorObject: any) {
    if (this.isApiError(errorObject)) {
      return new ApiError(errorObject.code, errorObject.message, errorObject.statusCode)
    }
    return new Error(errorObject)
  }

  private isApiError<T extends { code?: string; message?: string; statusCode?: number }>(error: T): boolean {
    return (
      typeof error.code === 'string' &&
      (typeof error.message === 'string' || Array.isArray(error.message)) &&
      typeof error.statusCode === 'number'
    )
  }
}
