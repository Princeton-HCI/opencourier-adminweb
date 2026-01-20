import { api as baseApi } from ".";
import { AppState } from "@/redux/store";
import { handleBackendError } from "./utils/api";

export const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getUserCount: build.query<number, void>({
      queryFn: async (_, api) => {
        try {
          const { accessToken } = (api.getState() as AppState).auth;
          const baseUrl =
            process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
          const response = await fetch(`${baseUrl}/api/admin/v1/users/count`, {
            headers: {
              Authorization: accessToken ? `Bearer ${accessToken}` : "",
            },
          });

          if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw {
              statusCode: response.status,
              message: body?.message || response.statusText,
            };
          }

          const json = await response.json();
          console.log(json);
          return {
            data:
              typeof json?.result.count === "number" ? json.result.count : 0,
          };
        } catch (error) {
          return {
            error: handleBackendError(error as any, api),
          };
        }
      },
    }),
  }),
});

export const { useGetUserCountQuery } = userApi;
