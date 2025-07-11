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

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface DeliveryAdminDto
 */
export interface DeliveryAdminDto {
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    pickupName: string;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    pickupPhoneNumber: string;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    pickupBusinessName: string;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    pickupNotes: string | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    pickupVerification: string | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    pickupLocationId: string;
    /**
     * 
     * @type {Date}
     * @memberof DeliveryAdminDto
     */
    pickupReadyAt: Date;
    /**
     * 
     * @type {Date}
     * @memberof DeliveryAdminDto
     */
    pickupDeadlineAt: Date;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    dropoffName: string;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    dropoffPhoneNumber: string;
    /**
     * 
     * @type {object}
     * @memberof DeliveryAdminDto
     */
    dropoffBusinessName: object | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    dropoffNotes: string | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    dropoffSellerNotes: string | null;
    /**
     * 
     * @type {object}
     * @memberof DeliveryAdminDto
     */
    dropoffVerification: object | null;
    /**
     * 
     * @type {Date}
     * @memberof DeliveryAdminDto
     */
    dropoffReadyAt: Date;
    /**
     * 
     * @type {Date}
     * @memberof DeliveryAdminDto
     */
    dropoffEta: Date | null;
    /**
     * 
     * @type {Date}
     * @memberof DeliveryAdminDto
     */
    dropoffDeadlineAt: Date;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    deliverableAction: DeliveryAdminDtoDeliverableActionEnum;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    undeliverableAction: DeliveryAdminDtoUndeliverableActionEnum;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    undeliverableReason: string | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    dropoffLocationId: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof DeliveryAdminDto
     */
    deliveryTypes: Array<string>;
    /**
     * 
     * @type {boolean}
     * @memberof DeliveryAdminDto
     */
    requiresDropoffSignature: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof DeliveryAdminDto
     */
    requiresId: boolean;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    orderReference: string | null;
    /**
     * 
     * @type {number}
     * @memberof DeliveryAdminDto
     */
    orderTotalValue: number | null;
    /**
     * 
     * @type {Array<object>}
     * @memberof DeliveryAdminDto
     */
    orderItems: Array<object> | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    status: DeliveryAdminDtoStatusEnum;
    /**
     * 
     * @type {Array<string>}
     * @memberof DeliveryAdminDto
     */
    customerNotes: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    currencyCode: string;
    /**
     * 
     * @type {number}
     * @memberof DeliveryAdminDto
     */
    totalCost: number | null;
    /**
     * 
     * @type {number}
     * @memberof DeliveryAdminDto
     */
    fee: number | null;
    /**
     * 
     * @type {number}
     * @memberof DeliveryAdminDto
     */
    pay: number | null;
    /**
     * 
     * @type {number}
     * @memberof DeliveryAdminDto
     */
    tips: number;
    /**
     * 
     * @type {number}
     * @memberof DeliveryAdminDto
     */
    totalCompensation: number | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof DeliveryAdminDto
     */
    pickupTypes: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    imageType: string | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    imageName: string | null;
    /**
     * 
     * @type {object}
     * @memberof DeliveryAdminDto
     */
    imageData: object | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    idempotencyKey: string | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    externalStoreId: string | null;
    /**
     * 
     * @type {object}
     * @memberof DeliveryAdminDto
     */
    returnVerification: object | null;
    /**
     * 
     * @type {object}
     * @memberof DeliveryAdminDto
     */
    externalUserInfo: object | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    externalId: string | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    courierId: string | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    partnerId: string | null;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    deliveryQuoteId: string;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    customerName: string;
    /**
     * 
     * @type {string}
     * @memberof DeliveryAdminDto
     */
    customerPhoneNumber: string | null;
    /**
     * 
     * @type {Date}
     * @memberof DeliveryAdminDto
     */
    createdAt: Date;
}


/**
 * @export
 */
export const DeliveryAdminDtoDeliverableActionEnum = {
    MeetAtDoor: 'MEET_AT_DOOR',
    LeaveAtDoor: 'LEAVE_AT_DOOR'
} as const;
export type DeliveryAdminDtoDeliverableActionEnum = typeof DeliveryAdminDtoDeliverableActionEnum[keyof typeof DeliveryAdminDtoDeliverableActionEnum];

/**
 * @export
 */
export const DeliveryAdminDtoUndeliverableActionEnum = {
    LeaveAtDoor: 'LEAVE_AT_DOOR',
    Return: 'RETURN',
    Discard: 'DISCARD'
} as const;
export type DeliveryAdminDtoUndeliverableActionEnum = typeof DeliveryAdminDtoUndeliverableActionEnum[keyof typeof DeliveryAdminDtoUndeliverableActionEnum];

/**
 * @export
 */
export const DeliveryAdminDtoStatusEnum = {
    Created: 'CREATED',
    AssigningCourier: 'ASSIGNING_COURIER',
    Accepted: 'ACCEPTED',
    Dispatched: 'DISPATCHED',
    CourierArrivedAtPickupLocation: 'COURIER_ARRIVED_AT_PICKUP_LOCATION',
    PickedUp: 'PICKED_UP',
    CourierArrivedAtDropoffLocation: 'COURIER_ARRIVED_AT_DROPOFF_LOCATION',
    DroppedOff: 'DROPPED_OFF',
    Canceled: 'CANCELED',
    Failed: 'FAILED'
} as const;
export type DeliveryAdminDtoStatusEnum = typeof DeliveryAdminDtoStatusEnum[keyof typeof DeliveryAdminDtoStatusEnum];


/**
 * Check if a given object implements the DeliveryAdminDto interface.
 */
export function instanceOfDeliveryAdminDto(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "pickupName" in value;
    isInstance = isInstance && "pickupPhoneNumber" in value;
    isInstance = isInstance && "pickupBusinessName" in value;
    isInstance = isInstance && "pickupNotes" in value;
    isInstance = isInstance && "pickupVerification" in value;
    isInstance = isInstance && "pickupLocationId" in value;
    isInstance = isInstance && "pickupReadyAt" in value;
    isInstance = isInstance && "pickupDeadlineAt" in value;
    isInstance = isInstance && "dropoffName" in value;
    isInstance = isInstance && "dropoffPhoneNumber" in value;
    isInstance = isInstance && "dropoffBusinessName" in value;
    isInstance = isInstance && "dropoffNotes" in value;
    isInstance = isInstance && "dropoffSellerNotes" in value;
    isInstance = isInstance && "dropoffVerification" in value;
    isInstance = isInstance && "dropoffReadyAt" in value;
    isInstance = isInstance && "dropoffEta" in value;
    isInstance = isInstance && "dropoffDeadlineAt" in value;
    isInstance = isInstance && "deliverableAction" in value;
    isInstance = isInstance && "undeliverableAction" in value;
    isInstance = isInstance && "undeliverableReason" in value;
    isInstance = isInstance && "dropoffLocationId" in value;
    isInstance = isInstance && "deliveryTypes" in value;
    isInstance = isInstance && "requiresDropoffSignature" in value;
    isInstance = isInstance && "requiresId" in value;
    isInstance = isInstance && "orderReference" in value;
    isInstance = isInstance && "orderTotalValue" in value;
    isInstance = isInstance && "orderItems" in value;
    isInstance = isInstance && "status" in value;
    isInstance = isInstance && "customerNotes" in value;
    isInstance = isInstance && "currencyCode" in value;
    isInstance = isInstance && "totalCost" in value;
    isInstance = isInstance && "fee" in value;
    isInstance = isInstance && "pay" in value;
    isInstance = isInstance && "tips" in value;
    isInstance = isInstance && "totalCompensation" in value;
    isInstance = isInstance && "pickupTypes" in value;
    isInstance = isInstance && "imageType" in value;
    isInstance = isInstance && "imageName" in value;
    isInstance = isInstance && "imageData" in value;
    isInstance = isInstance && "idempotencyKey" in value;
    isInstance = isInstance && "externalStoreId" in value;
    isInstance = isInstance && "returnVerification" in value;
    isInstance = isInstance && "externalUserInfo" in value;
    isInstance = isInstance && "externalId" in value;
    isInstance = isInstance && "courierId" in value;
    isInstance = isInstance && "partnerId" in value;
    isInstance = isInstance && "deliveryQuoteId" in value;
    isInstance = isInstance && "customerName" in value;
    isInstance = isInstance && "customerPhoneNumber" in value;
    isInstance = isInstance && "createdAt" in value;

    return isInstance;
}

export function DeliveryAdminDtoFromJSON(json: any): DeliveryAdminDto {
    return DeliveryAdminDtoFromJSONTyped(json, false);
}

export function DeliveryAdminDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): DeliveryAdminDto {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'pickupName': json['pickupName'],
        'pickupPhoneNumber': json['pickupPhoneNumber'],
        'pickupBusinessName': json['pickupBusinessName'],
        'pickupNotes': json['pickupNotes'],
        'pickupVerification': json['pickupVerification'],
        'pickupLocationId': json['pickupLocationId'],
        'pickupReadyAt': (new Date(json['pickupReadyAt'])),
        'pickupDeadlineAt': (new Date(json['pickupDeadlineAt'])),
        'dropoffName': json['dropoffName'],
        'dropoffPhoneNumber': json['dropoffPhoneNumber'],
        'dropoffBusinessName': json['dropoffBusinessName'],
        'dropoffNotes': json['dropoffNotes'],
        'dropoffSellerNotes': json['dropoffSellerNotes'],
        'dropoffVerification': json['dropoffVerification'],
        'dropoffReadyAt': (new Date(json['dropoffReadyAt'])),
        'dropoffEta': (json['dropoffEta'] === null ? null : new Date(json['dropoffEta'])),
        'dropoffDeadlineAt': (new Date(json['dropoffDeadlineAt'])),
        'deliverableAction': json['deliverableAction'],
        'undeliverableAction': json['undeliverableAction'],
        'undeliverableReason': json['undeliverableReason'],
        'dropoffLocationId': json['dropoffLocationId'],
        'deliveryTypes': json['deliveryTypes'],
        'requiresDropoffSignature': json['requiresDropoffSignature'],
        'requiresId': json['requiresId'],
        'orderReference': json['orderReference'],
        'orderTotalValue': json['orderTotalValue'],
        'orderItems': json['orderItems'],
        'status': json['status'],
        'customerNotes': json['customerNotes'],
        'currencyCode': json['currencyCode'],
        'totalCost': json['totalCost'],
        'fee': json['fee'],
        'pay': json['pay'],
        'tips': json['tips'],
        'totalCompensation': json['totalCompensation'],
        'pickupTypes': json['pickupTypes'],
        'imageType': json['imageType'],
        'imageName': json['imageName'],
        'imageData': json['imageData'],
        'idempotencyKey': json['idempotencyKey'],
        'externalStoreId': json['externalStoreId'],
        'returnVerification': json['returnVerification'],
        'externalUserInfo': json['externalUserInfo'],
        'externalId': json['externalId'],
        'courierId': json['courierId'],
        'partnerId': json['partnerId'],
        'deliveryQuoteId': json['deliveryQuoteId'],
        'customerName': json['customerName'],
        'customerPhoneNumber': json['customerPhoneNumber'],
        'createdAt': (new Date(json['createdAt'])),
    };
}

export function DeliveryAdminDtoToJSON(value?: DeliveryAdminDto | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'pickupName': value.pickupName,
        'pickupPhoneNumber': value.pickupPhoneNumber,
        'pickupBusinessName': value.pickupBusinessName,
        'pickupNotes': value.pickupNotes,
        'pickupVerification': value.pickupVerification,
        'pickupLocationId': value.pickupLocationId,
        'pickupReadyAt': (value.pickupReadyAt.toISOString()),
        'pickupDeadlineAt': (value.pickupDeadlineAt.toISOString()),
        'dropoffName': value.dropoffName,
        'dropoffPhoneNumber': value.dropoffPhoneNumber,
        'dropoffBusinessName': value.dropoffBusinessName,
        'dropoffNotes': value.dropoffNotes,
        'dropoffSellerNotes': value.dropoffSellerNotes,
        'dropoffVerification': value.dropoffVerification,
        'dropoffReadyAt': (value.dropoffReadyAt.toISOString()),
        'dropoffEta': (value.dropoffEta === null ? null : value.dropoffEta.toISOString()),
        'dropoffDeadlineAt': (value.dropoffDeadlineAt.toISOString()),
        'deliverableAction': value.deliverableAction,
        'undeliverableAction': value.undeliverableAction,
        'undeliverableReason': value.undeliverableReason,
        'dropoffLocationId': value.dropoffLocationId,
        'deliveryTypes': value.deliveryTypes,
        'requiresDropoffSignature': value.requiresDropoffSignature,
        'requiresId': value.requiresId,
        'orderReference': value.orderReference,
        'orderTotalValue': value.orderTotalValue,
        'orderItems': value.orderItems,
        'status': value.status,
        'customerNotes': value.customerNotes,
        'currencyCode': value.currencyCode,
        'totalCost': value.totalCost,
        'fee': value.fee,
        'pay': value.pay,
        'tips': value.tips,
        'totalCompensation': value.totalCompensation,
        'pickupTypes': value.pickupTypes,
        'imageType': value.imageType,
        'imageName': value.imageName,
        'imageData': value.imageData,
        'idempotencyKey': value.idempotencyKey,
        'externalStoreId': value.externalStoreId,
        'returnVerification': value.returnVerification,
        'externalUserInfo': value.externalUserInfo,
        'externalId': value.externalId,
        'courierId': value.courierId,
        'partnerId': value.partnerId,
        'deliveryQuoteId': value.deliveryQuoteId,
        'customerName': value.customerName,
        'customerPhoneNumber': value.customerPhoneNumber,
        'createdAt': (value.createdAt.toISOString()),
    };
}

