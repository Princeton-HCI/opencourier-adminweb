/* tslint:disable */
/* eslint-disable */
/**
 * OPENCOURIER-API
 * OpenCourier Backend API
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  DeliveryAdminDto,
  DeliveryAdminPaginatedDto,
  DeliverySubmitEventAdminInput,
  ForbiddenException,
  NotFoundException,
} from '../models/index';
import {
    DeliveryAdminDtoFromJSON,
    DeliveryAdminDtoToJSON,
    DeliveryAdminPaginatedDtoFromJSON,
    DeliveryAdminPaginatedDtoToJSON,
    DeliverySubmitEventAdminInputFromJSON,
    DeliverySubmitEventAdminInputToJSON,
    ForbiddenExceptionFromJSON,
    ForbiddenExceptionToJSON,
    NotFoundExceptionFromJSON,
    NotFoundExceptionToJSON,
} from '../models/index';

export interface DeliveriesApiGetDeliveriesRequest {
    page?: number;
    perPage?: number;
    courierId?: string;
}

export interface DeliveriesApiGetDeliveryRequest {
    deliveryId: string;
}

export interface DeliveriesApiSubmitOrderEventRequest {
    id: string;
    deliverySubmitEventAdminInput: DeliverySubmitEventAdminInput;
}

/**
 * 
 */
export class DeliveriesApi extends runtime.BaseAPI {

    /**
     * Get deliveries
     */
    async getDeliveriesRaw(requestParameters: DeliveriesApiGetDeliveriesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<DeliveryAdminPaginatedDto>> {
        const queryParameters: any = {};

        if (requestParameters.page !== undefined) {
            queryParameters['page'] = requestParameters.page;
        }

        if (requestParameters.perPage !== undefined) {
            queryParameters['perPage'] = requestParameters.perPage;
        }

        if (requestParameters.courierId !== undefined) {
            queryParameters['courierId'] = requestParameters.courierId;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/admin/v1/deliveries`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DeliveryAdminPaginatedDtoFromJSON(jsonValue));
    }

    /**
     * Get deliveries
     */
    async getDeliveries(requestParameters: DeliveriesApiGetDeliveriesRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<DeliveryAdminPaginatedDto> {
        const response = await this.getDeliveriesRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get delivery by id
     */
    async getDeliveryRaw(requestParameters: DeliveriesApiGetDeliveryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<DeliveryAdminDto>> {
        if (requestParameters.deliveryId === null || requestParameters.deliveryId === undefined) {
            throw new runtime.RequiredError('deliveryId','Required parameter requestParameters.deliveryId was null or undefined when calling getDelivery.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/admin/v1/deliveries/{deliveryId}`.replace(`{${"deliveryId"}}`, encodeURIComponent(String(requestParameters.deliveryId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DeliveryAdminDtoFromJSON(jsonValue));
    }

    /**
     * Get delivery by id
     */
    async getDelivery(requestParameters: DeliveriesApiGetDeliveryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<DeliveryAdminDto> {
        const response = await this.getDeliveryRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async submitOrderEventRaw(requestParameters: DeliveriesApiSubmitOrderEventRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<DeliveryAdminDto>> {
        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling submitOrderEvent.');
        }

        if (requestParameters.deliverySubmitEventAdminInput === null || requestParameters.deliverySubmitEventAdminInput === undefined) {
            throw new runtime.RequiredError('deliverySubmitEventAdminInput','Required parameter requestParameters.deliverySubmitEventAdminInput was null or undefined when calling submitOrderEvent.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/admin/v1/deliveries/{id}/submit-event`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: DeliverySubmitEventAdminInputToJSON(requestParameters.deliverySubmitEventAdminInput),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DeliveryAdminDtoFromJSON(jsonValue));
    }

    /**
     */
    async submitOrderEvent(requestParameters: DeliveriesApiSubmitOrderEventRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<DeliveryAdminDto> {
        const response = await this.submitOrderEventRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
