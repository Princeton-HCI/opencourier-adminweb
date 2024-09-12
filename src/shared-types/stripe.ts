export enum EnumPaymentStatus {
  CANCELED = 'CANCELED',
  REQUIRES_CONFIRMATION = 'REQUIRES_CONFIRMATION',
  REQUIRES_CAPTURE = 'REQUIRES_CAPTURE',
  PROCESSING = 'PROCESSING',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
  REQUIRES_PAYMENT_METHOD = 'REQUIRES_PAYMENT_METHOD',
  SUCCEEDED = 'SUCCEEDED'
}

export const PAYMENT_STATUS_TO_HUMAN: Record<EnumPaymentStatus, string> = {
  CANCELED: 'Canceled',
  REQUIRES_CONFIRMATION: 'Requires Confirmation',
  REQUIRES_CAPTURE: 'Waiting to be captures',
  PROCESSING: 'Processing',
  REQUIRES_ACTION: 'Requires customer action',
  REQUIRES_PAYMENT_METHOD: 'Missing a valid payment method',
  SUCCEEDED: 'Succeeded',
}
