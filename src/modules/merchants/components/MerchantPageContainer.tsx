import { EAdminRoutes, Routes, useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import { useUpdateMerchantSheet } from '@/modules/merchants/hook/sheet/useUpdateMerchantSheet'
import { Button, Tabs, TabsList, TabsTrigger } from '../../../admin-web-components'
import { MerchantAdminDto } from '../../../backend-admin-sdk'
import { ArrowLeftIcon, PencilIcon } from 'lucide-react'
import { useRouter } from 'next/router'
import { HTMLAttributes } from 'react'

type MerchantPageContainerProps = HTMLAttributes<HTMLDivElement> & {
  merchant: MerchantAdminDto
}

export function MerchantPageContainer({ children, merchant }: MerchantPageContainerProps) {
  const router = useRouter()
  const merchantGroupId = typeof router.query.merchantGroupId === 'string' ? router.query.merchantGroupId : ''
  const merchantId = typeof router.query.merchantId === 'string' ? router.query.merchantId : ''
  const { goToPartners, goToCatalogs, goToPartnerDetails } = useAdminPageNavigator()
  const updateMerchantSheet = useUpdateMerchantSheet({ merchantId, defaultValues: merchant })
  return (
    <>
      <Button variant="link" className="p-0" onClick={() => goToPartners(merchantGroupId)}>
        <div className="bg-gray-100 rounded-full h-6 w-6 flex justify-center items-center mr-1">
          <ArrowLeftIcon className="w-4" />
        </div>
        Back to Merchants
      </Button>

      <div className="flex justify-between">
        <h2 className="text-xl font-medium tracking-tight">{merchant.name}</h2>
        <Button variant="outline" onClick={updateMerchantSheet.open}>
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <Tabs
        value={Routes.indexOf(router.pathname as EAdminRoutes).toString()}
        onValueChange={async (value) => {
          if (Routes[Number(value)] === EAdminRoutes.MERCHANT_DETAILS) {
            await goToPartnerDetails(merchantGroupId, merchantId)
          } else if (Routes[Number(value)] === EAdminRoutes.CATALOGS) {
            await goToCatalogs(merchantGroupId, merchantId)
          }
        }}
      >
        <TabsList>
          <TabsTrigger value={Routes.indexOf(EAdminRoutes.MERCHANT_DETAILS).toString()}>Merchant details</TabsTrigger>
          <TabsTrigger value={Routes.indexOf(EAdminRoutes.CATALOGS).toString()}>Catalogs</TabsTrigger>
        </TabsList>
      </Tabs>

      {children}
    </>
  )
}
