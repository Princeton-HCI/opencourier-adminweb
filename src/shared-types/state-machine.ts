import { EnumDeliveryEventType, EnumDeliveryStatus } from "./delivery-events";

export const STATUS_TO_HUMAN: Record<EnumDeliveryStatus, string> = {
	CREATED: 'Created',
	ASSIGNING_COURIER: 'Assigning Courier',
	ACCEPTED: 'Accepted',
	DISPATCHED: 'Dispatched',
	COURIER_ARRIVED_AT_PICKUP_LOCATION: 'Courier Arrived At Pickup Location',
	PICKED_UP: 'Picked Up',
	ON_THE_WAY: 'On The Way',
	COURIER_ARRIVED_AT_DROPOFF_LOCATION: 'Courier Arrived At Dropoff Location',
	DROPPED_OFF: 'Dropped Off',
	CANCELED: 'Canceled',
	FAILED: 'Failed',
}

export type DeliveryStateTransitions = Partial<
	Record<EnumDeliveryEventType, EnumDeliveryStatus>
>

export type DeliveryStateNode = {
	on: DeliveryStateTransitions
}

/** Allowed event types from each status (matches admin submit flow where possible). */
export const STATE_MACHINE: Record<EnumDeliveryStatus, DeliveryStateNode> = {
	[EnumDeliveryStatus.CREATED]: {
		on: {
			[EnumDeliveryEventType.CONFIRMED]: EnumDeliveryStatus.ASSIGNING_COURIER,
			[EnumDeliveryEventType.CANCELED]: EnumDeliveryStatus.CANCELED,
			[EnumDeliveryEventType.FAILED]: EnumDeliveryStatus.FAILED,
		},
	},
	[EnumDeliveryStatus.ASSIGNING_COURIER]: {
		on: {
			[EnumDeliveryEventType.ACCEPTED]: EnumDeliveryStatus.ACCEPTED,
			[EnumDeliveryEventType.REJECTED]: EnumDeliveryStatus.CREATED,
			[EnumDeliveryEventType.CANCELED]: EnumDeliveryStatus.CANCELED,
			[EnumDeliveryEventType.FAILED]: EnumDeliveryStatus.FAILED,
		},
	},
	[EnumDeliveryStatus.ACCEPTED]: {
		on: {
			[EnumDeliveryEventType.DISPATCHED]: EnumDeliveryStatus.DISPATCHED,
			[EnumDeliveryEventType.CANCELED]: EnumDeliveryStatus.CANCELED,
			[EnumDeliveryEventType.FAILED]: EnumDeliveryStatus.FAILED,
		},
	},
	[EnumDeliveryStatus.DISPATCHED]: {
		on: {
			[EnumDeliveryEventType.ARRIVED_AT_PICKUP_LOCATION]: EnumDeliveryStatus.COURIER_ARRIVED_AT_PICKUP_LOCATION,
			[EnumDeliveryEventType.CANCELED]: EnumDeliveryStatus.CANCELED,
			[EnumDeliveryEventType.FAILED]: EnumDeliveryStatus.FAILED,
		},
	},
	[EnumDeliveryStatus.COURIER_ARRIVED_AT_PICKUP_LOCATION]: {
		on: {
			[EnumDeliveryEventType.PICKED_UP]: EnumDeliveryStatus.PICKED_UP,
			[EnumDeliveryEventType.CANCELED]: EnumDeliveryStatus.CANCELED,
			[EnumDeliveryEventType.FAILED]: EnumDeliveryStatus.FAILED,
		},
	},
	[EnumDeliveryStatus.PICKED_UP]: {
		on: {
			[EnumDeliveryEventType.ON_THE_WAY]: EnumDeliveryStatus.ON_THE_WAY,
			[EnumDeliveryEventType.CANCELED]: EnumDeliveryStatus.CANCELED,
			[EnumDeliveryEventType.FAILED]: EnumDeliveryStatus.FAILED,
		},
	},
	[EnumDeliveryStatus.ON_THE_WAY]: {
		on: {
			[EnumDeliveryEventType.ARRIVED_AT_DROPOFF_LOCATION]: EnumDeliveryStatus.COURIER_ARRIVED_AT_DROPOFF_LOCATION,
			[EnumDeliveryEventType.CANCELED]: EnumDeliveryStatus.CANCELED,
			[EnumDeliveryEventType.FAILED]: EnumDeliveryStatus.FAILED,
		},
	},
	[EnumDeliveryStatus.COURIER_ARRIVED_AT_DROPOFF_LOCATION]: {
		on: {
			[EnumDeliveryEventType.DROPPED_OFF]: EnumDeliveryStatus.DROPPED_OFF,
			[EnumDeliveryEventType.FULFILLED]: EnumDeliveryStatus.DROPPED_OFF,
			[EnumDeliveryEventType.CANCELED]: EnumDeliveryStatus.CANCELED,
			[EnumDeliveryEventType.FAILED]: EnumDeliveryStatus.FAILED,
		},
	},
	[EnumDeliveryStatus.DROPPED_OFF]: { on: {} },
	[EnumDeliveryStatus.CANCELED]: { on: {} },
	[EnumDeliveryStatus.FAILED]: { on: {} },
}
