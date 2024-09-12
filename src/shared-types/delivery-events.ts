export enum EnumDeliveryEventType {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  DISPATCHED = 'DISPATCHED',
  CANCELED = 'CANCELED',
  FULFILLED = 'FULFILLED',
  ARRIVED_AT_DROPOFF_LOCATION = 'ARRIVED_AT_DROPOFF_LOCATION',
  DROPPED_OFF = 'DROPPED_OFF',
  ARRIVED_AT_PICKUP_LOCATION = 'ARRIVED_AT_PICKUP_LOCATION',
  PICKED_UP = 'PICKED_UP',
  ON_THE_WAY = 'ON_THE_WAY',
  FAILED = 'FAILED'
}

export enum EnumEventActor {
  COURIER = 'COURIER',
  ADMIN = 'ADMIN',
  PARTNER = 'PARTNER'
}

export enum EnumDeliveryEventSource {
  OPENCOURIER = 'OPENCOURIER',
  PARTNER_APP = 'PARTNER_APP'
}

export enum EnumDeliveryStatus {
  CREATED = 'CREATED',
  ASSIGNING_COURIER = 'ASSIGNING_COURIER',
  ACCEPTED = 'ACCEPTED',
  DISPATCHED = 'DISPATCHED',
  COURIER_ARRIVED_AT_PICKUP_LOCATION = 'COURIER_ARRIVED_AT_PICKUP_LOCATION',
  PICKED_UP = 'PICKED_UP',
  ON_THE_WAY = 'ON_THE_WAY',
  COURIER_ARRIVED_AT_DROPOFF_LOCATION = 'COURIER_ARRIVED_AT_DROPOFF_LOCATION',
  DROPPED_OFF = 'DROPPED_OFF',
  CANCELED = 'CANCELED',
  FAILED = 'FAILED'
}

export interface BaseDeliveryEvent {
  deliveryId: string
  type: EnumDeliveryEventType
  actor: EnumEventActor
  source: EnumDeliveryEventSource
  courierId?: string | null
  message?: string
}

export interface DeliveryCreatedEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.CREATED
}
export interface DeliveryConfirmedEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.CONFIRMED
}
export interface DeliveryAcceptedEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.ACCEPTED
}
export interface DeliveryRejectedEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.REJECTED
}
export interface DeliveryCanceledEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.CANCELED
}
export interface DeliveryFailedEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.FAILED
}

export interface DeliveryFulfilledEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.FULFILLED
}

export interface DeliveryDispatchedEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.DISPATCHED
}

export interface DeliveryCourierArrivedAtPickUpLocationEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.ARRIVED_AT_PICKUP_LOCATION
}

export interface DeliveryPickedUpEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.PICKED_UP
}

export interface DeliveryCourierArrivedAtDropOffLocationEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.ARRIVED_AT_DROPOFF_LOCATION
}
export interface DeliveryOnTheWayEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.ON_THE_WAY
}

export interface DeliveryDroppedOffEvent extends BaseDeliveryEvent {
  type: typeof EnumDeliveryEventType.DROPPED_OFF
  deliveredData: {
    imageData?: Buffer
    imageName?: string
    imageType?: string
  }
}

export type DeliveryEvent =
  | DeliveryCreatedEvent
  | DeliveryAcceptedEvent
  | DeliveryDispatchedEvent
  | DeliveryRejectedEvent
  | DeliveryConfirmedEvent
  | DeliveryFulfilledEvent
  | DeliveryCourierArrivedAtPickUpLocationEvent
  | DeliveryPickedUpEvent
  | DeliveryOnTheWayEvent
  | DeliveryCourierArrivedAtDropOffLocationEvent
  | DeliveryDroppedOffEvent
  | DeliveryCanceledEvent
  | DeliveryFailedEvent

export interface ResolvedPendingKeyRotation {
  accountKeys: []
}

export interface DeliveryStatusUpdateEvent {
  deliveryId: string
  oldStatus: EnumDeliveryStatus
  status: EnumDeliveryStatus
  event: DeliveryEvent
  courierId?: string
}

export const ACTIVE_STATUSES: EnumDeliveryStatus[] = [
  EnumDeliveryStatus.CREATED,
  EnumDeliveryStatus.DISPATCHED,
  EnumDeliveryStatus.PICKED_UP,
  EnumDeliveryStatus.ON_THE_WAY,
  EnumDeliveryStatus.DROPPED_OFF,
  EnumDeliveryStatus.CANCELED,
]
export const NOT_ACTIVE_STATUSES: EnumDeliveryStatus[] = [EnumDeliveryStatus.CANCELED, EnumDeliveryStatus.DROPPED_OFF]
