import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import { DeliveryDetails } from '@/modules/deliveries/components/DeliveryDetails'
import { NextPageWithLayout } from '@/pages/_app'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

const ViewDeliveryPage: NextPageWithLayout = () => {
  const router = useRouter()
  const deliveryId = router.query.deliveryId as string
  return <DeliveryDetails deliveryId={deliveryId} />
}

ViewDeliveryPage.getLayout = (page: ReactElement) => <DefaultLayout>{page}</DefaultLayout>

export default ViewDeliveryPage
