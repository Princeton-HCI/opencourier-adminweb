import { Tags } from '@/api/utils/tags';
import { api as baseApi, prepareAdminSdk } from '.';
import { handleBackendError } from './utils/api';
import { ICourierMatcherInput, ICourierMatcherResult } from '@/backend-admin-sdk/src/models';
import { ApiError } from '../backend-admin-sdk';

export const matchingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    // Fetch available couriers
    // getCouriers: build.query<string[], void>({
    //   queryFn: async (_, api) => {
    //     try {
    //       const sdk = prepareAdminSdk('');
    //       const data = await sdk.testing().getCouriers(); 
    //       return { data };
    //     } catch (error) {
    //       return {
    //         error: handleBackendError(error, api),
    //       };
    //     }
    //   },
    //   providesTags: [Tags.couriers],
    // }),

    // Simulate batch matching
   // Simulate batch matching
simulateMatching: build.mutation<ICourierMatcherResult[], ICourierMatcherInput[]>({
  queryFn: async (deliveriesInput, api) => {
    try {
      // Skip the SDK entirely and use direct fetch
      const token = process.env.NEXT_PUBLIC_API_TOKEN || '';
      console.log('Token from env variables:', token ? 'Token exists' : 'No token found');
      const response = await fetch('http://localhost:3000/api/partner/v1/testing/batch-match-couriers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN || ''}`,
        },
        body: JSON.stringify(deliveriesInput),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Direct Fetch Response:', data);
      return { data };
    } catch (error) {
      console.error('Error in simulateMatching:', error); 
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'Error',
        } as ApiError,
      };
    }
  },
  invalidatesTags: [Tags.matchingResults],
}),
  }),
});
      //   try {
      //     const sdk = prepareAdminSdk('', 'http://localhost:3000/api/partner/v1');
      //     console.log('Deliveries Input:', deliveriesInput);
      //     const data = await sdk.testing().batchMatchCouriersToDeliveries(deliveriesInput); 
      //     console.log('SDK Response:', data);
      //     return { data };
      //   } catch (error) {
      //     console.error('Error in simulateMatching:', error); 
      //     return {
      //       error: handleBackendError(error, api),
      //     };
      //   }
      // },
      // invalidatesTags: [Tags.matchingResults],
//     }),
//   }),
// });

export const { useSimulateMatchingMutation } = matchingApi;