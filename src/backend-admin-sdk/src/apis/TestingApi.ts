import * as runtime from '../runtime';
import type { ICourierMatcherInput, ICourierMatcherResult } from '../models/index';

export class TestingApi extends runtime.BaseAPI {
  /**
   * Batch match couriers to deliveries
   */
  async batchMatchCouriersToDeliveriesRaw(
    deliveriesInput: ICourierMatcherInput[],
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<ICourierMatcherResult[]>> {
    const headerParameters: runtime.HTTPHeaders = {
      'Content-Type': 'application/json',
    };

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('bearer', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    const response = await this.request(
      {
        path: `/api/admin/v1/testing/batch-match-couriers`,
        method: 'POST',
        headers: headerParameters,
        body: JSON.stringify(deliveriesInput),
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue as ICourierMatcherResult[]);
  }

  /**
   * Batch match couriers to deliveries
   */
  async batchMatchCouriersToDeliveries(
    deliveriesInput: ICourierMatcherInput[],
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<ICourierMatcherResult[]> {
    const response = await this.batchMatchCouriersToDeliveriesRaw(deliveriesInput, initOverrides);
    return await response.value();
  }
}