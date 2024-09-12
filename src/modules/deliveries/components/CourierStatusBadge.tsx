import { Badge } from '../../../admin-web-components'
import { COURIER_STATUS_TO_HUMAN, EnumCourierStatus } from '../../../shared-types'

type CourierStatusBadgeProps = {
  status: EnumCourierStatus
}

export function CourierStatusBadge({ status }: CourierStatusBadgeProps) {
  return <Badge variant="outline">{COURIER_STATUS_TO_HUMAN[status]}</Badge>
}
