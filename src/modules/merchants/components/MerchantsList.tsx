import { Avatar, AvatarFallback, AvatarImage, Button, Card } from '../../../admin-web-components'
import { useCreateMerchantSheet } from '@/modules/merchants/hook/sheet/useCreateMerchantSheet'
import { useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import { MerchantAdminDto, MerchantOrganizationAdminDto } from '../../../backend-admin-sdk'
import { getAddressDisplay } from '../../../ui-shared-utils'
import { PlusIcon } from 'lucide-react'

type MerchantsListProps = {
  organizations: MerchantOrganizationAdminDto[]
  merchants: MerchantAdminDto[]
  merchantGroupId: string
  isLoading: boolean
}

export function MerchantsList(props: MerchantsListProps) {
  const { goToPartnerDetails } = useAdminPageNavigator()
  const createMerchantSheet = useCreateMerchantSheet({})

  return (
    <div>
      {props.organizations.map((org) => (
        <div>
          <div className="flex flex-row justify-between items-center mb-6 mt-12">
            <div className="flex items-center space-x-4 pt-2">
              <Avatar className="w-12 h-12">
                {org.logo ? <AvatarImage src={org.logo} /> : <AvatarFallback className="bg-slate-200"></AvatarFallback>}
              </Avatar>
              <h5 className="text-lg font-bold tracking-tight">{org.name}</h5>
            </div>
            <div>
              <Button variant="secondary" onClick={() => createMerchantSheet.open(org.id)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                New merchant
              </Button>
            </div>
          </div>
          <ul>
            {props.merchants
              .filter((merchant) => merchant.merchantOrganizationId === org.id)
              .map((merchant) => (
                <li>
                  <Card
                    className="p-4 mb-6 cursor-pointer"
                    onClick={() => goToPartnerDetails(props.merchantGroupId, merchant.id)}
                  >
                    <div className="text-md font-bold">{merchant.name}</div>
                    <div className="text-sm text-muted-foreground">{getAddressDisplay(merchant)}</div>
                  </Card>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
