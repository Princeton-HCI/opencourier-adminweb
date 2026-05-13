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

/**
 * Admin `submit-event` / processDeliveryEvent (opencourier-backend) alignment:
 *
 * - CONFIRMED — not a status-changing admin event; omitted from STATE_MACHINE.
 * - ACCEPTED — offerDeliveryToCourierAsAdmin when CREATED / ASSIGNING_COURIER with no courier yet → ASSIGNING_COURIER;
 *   courier acceptance from ASSIGNING_COURIER → ACCEPTED. (Manual assign with courierId uses assignDeliveryToCourier.)
 * - DISPATCHED — ASSIGNING_COURIER → DISPATCHED, ACCEPTED → DISPATCHED.
 * - REJECTED — ASSIGNING_COURIER → ASSIGNING_COURIER.
 * - PICKED_UP — ACCEPTED | DISPATCHED | COURIER_ARRIVED_AT_PICKUP_LOCATION → PICKED_UP.
 * - CANCELED — non-terminal pre-dropoff states.
 * - DROPPED_OFF — ON_THE_WAY | COURIER_ARRIVED_AT_DROPOFF_LOCATION → DROPPED_OFF (FULFILLED on doorstep unchanged).
 * - FAILED — per transitions below; also CANCELED → FAILED.
 */
export const STATE_MACHINE: Record<EnumDeliveryStatus, DeliveryStateNode> = {
	[EnumDeliveryStatus.CREATED]: {
		on: {
			[EnumDeliveryEventType.ACCEPTED]: EnumDeliveryStatus.ASSIGNING_COURIER,
			[EnumDeliveryEventType.CANCELED]: EnumDeliveryStatus.CANCELED,
			[EnumDeliveryEventType.FAILED]: EnumDeliveryStatus.FAILED,
		},
	},
	[EnumDeliveryStatus.ASSIGNING_COURIER]: {
		on: {
			[EnumDeliveryEventType.DISPATCHED]: EnumDeliveryStatus.DISPATCHED,
			[EnumDeliveryEventType.ACCEPTED]: EnumDeliveryStatus.ACCEPTED,
			[EnumDeliveryEventType.REJECTED]: EnumDeliveryStatus.ASSIGNING_COURIER,
			[EnumDeliveryEventType.CANCELED]: EnumDeliveryStatus.CANCELED,
			[EnumDeliveryEventType.FAILED]: EnumDeliveryStatus.FAILED,
		},
	},
	[EnumDeliveryStatus.ACCEPTED]: {
		on: {
			[EnumDeliveryEventType.DISPATCHED]: EnumDeliveryStatus.DISPATCHED,
			[EnumDeliveryEventType.PICKED_UP]: EnumDeliveryStatus.PICKED_UP,
			[EnumDeliveryEventType.CANCELED]: EnumDeliveryStatus.CANCELED,
			[EnumDeliveryEventType.FAILED]: EnumDeliveryStatus.FAILED,
		},
	},
	[EnumDeliveryStatus.DISPATCHED]: {
		on: {
			[EnumDeliveryEventType.ARRIVED_AT_PICKUP_LOCATION]: EnumDeliveryStatus.COURIER_ARRIVED_AT_PICKUP_LOCATION,
			[EnumDeliveryEventType.PICKED_UP]: EnumDeliveryStatus.PICKED_UP,
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
			[EnumDeliveryEventType.DROPPED_OFF]: EnumDeliveryStatus.DROPPED_OFF,
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
	[EnumDeliveryStatus.CANCELED]: {
		on: {
			[EnumDeliveryEventType.FAILED]: EnumDeliveryStatus.FAILED,
		},
	},
	[EnumDeliveryStatus.FAILED]: { on: {} },
}
