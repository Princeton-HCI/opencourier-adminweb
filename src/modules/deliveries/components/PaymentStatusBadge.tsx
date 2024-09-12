import { Badge } from '../../../admin-web-components'
import { EnumPaymentStatus, PAYMENT_STATUS_TO_HUMAN } from '../../../shared-types'

type PaymentStatusBadgeProps = {
  status: EnumPaymentStatus
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <Badge variant="secondary" className="text-xs py-1 px-2 inline-flex items-center gap-2 ml-4">
      {PAYMENT_STATUS_TO_HUMAN[status]}
    </Badge>
  )
}
