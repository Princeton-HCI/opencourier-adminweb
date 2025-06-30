import { EnumDeliveryStatus } from "./delivery-events";

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
