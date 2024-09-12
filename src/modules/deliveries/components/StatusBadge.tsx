import { Badge } from '../../../admin-web-components'
import { EnumDeliveryStatus, STATUS_TO_HUMAN } from '../../../shared-types'

type StatusBadgeProps = {
  status: EnumDeliveryStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant="outline">{STATUS_TO_HUMAN[status]}</Badge>
}
