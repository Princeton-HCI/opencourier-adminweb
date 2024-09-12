import { EnumDeliveryEventType } from '../../../shared-types'
import { RefundAdminDtoReasonEnum } from '../../../backend-admin-sdk'

export interface OrderEventFormValues {
  eventType: EnumDeliveryEventType
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
