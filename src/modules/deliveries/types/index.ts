import { EnumDeliveryEventType } from '../../../shared-types'
import { RefundAdminDtoReasonEnum } from '../../../backend-admin-sdk'

export interface OrderEventFormValues {
  /** Empty until the user selects an event from STATE_MACHINE for the current status. */
  eventType: EnumDeliveryEventType | ''
}

export interface ReversalFormValues {
  reversalAmount: number
}

export interface IssueRefundFormValues {
  description: string
  amount: number
  reason: RefundAdminDtoReasonEnum
}

export interface CancelRefundFormValues {
  refundId: string
}
