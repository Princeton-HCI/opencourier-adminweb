import { Card, CardContent, CardHeader, CardTitle, Label } from '../../../admin-web-components'
import { MerchantAdminDto } from '../../../backend-admin-sdk'
import { getAddressDisplay } from '../../../ui-shared-utils'

export function MerchantCardDetails({ merchant }: { merchant: MerchantAdminDto }) {
  return (
    <Card className="mt-4">
      <CardHeader className="md:text-xl">
        <CardTitle>Merchant Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* <Label className="flex flex-col space-y-1">
          <span>Name</span>
          <span className="font-normal leading-snug text-muted-foreground">{merchant.name}</span>
        </Label> */}
        <Label className="flex flex-col space-y-1">
          <span>E-mail</span>
          <span className="font-normal leading-snug text-muted-foreground">{merchant.email}</span>
        </Label>
        <Label className="flex flex-col space-y-1">
          <span>Phone</span>
          <span className="font-normal leading-snug text-muted-foreground">{merchant.phone}</span>
        </Label>
        <Label className="flex flex-col space-y-1">
          <span>Address</span>
          <span className="font-normal leading-snug text-muted-foreground">{getAddressDisplay(merchant)}</span>
        </Label>
        <Label className="flex flex-col space-y-1">
          <span>Active</span>
          <span className="font-normal leading-snug text-muted-foreground">
            {merchant.inactiveUntil ? 'No' : 'Yes'}
          </span>
        </Label>
      </CardContent>
    </Card>
  )
}
