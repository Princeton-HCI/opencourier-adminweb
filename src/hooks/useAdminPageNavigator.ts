import { useRouter } from 'next/router'

export enum EAdminRoutes {
  HOME = '/',
  INSTANCE_CONFIGURATION = '/instance-configuration',
  LOGIN = '/login',
  PARTNERS = '/partners/[partnerId]',
  PARTNER_DETAILS = '/partners/[partnerId]',
  DELIVERIES = '/deliveries',
  DELIVERY_DETAILS = '/deliveries/[deliveryId]',
  COURIERS = '/couriers',
  COURIER_DETAILS = '/couriers/[courierId]',
  TESTING = '/test-matching'
}

export const Routes = Object.values(EAdminRoutes)

type NavigationArgs = {
  query?: Record<string, string>
  search?: string | null | undefined
}

/** Handle admins web apps navigation. */
export const useAdminPageNavigator = () => {
  const router = useRouter()
  return {
    goHome: (args?: NavigationArgs) => router.push({ pathname: EAdminRoutes.HOME, ...args }),
    goToLogin: (args?: NavigationArgs) => router.push({ pathname: EAdminRoutes.LOGIN, ...args }),
    goToPartners: (args?: NavigationArgs) => router.push({ pathname: EAdminRoutes.PARTNERS, ...args }),
    goToPartnerDetails: (partnerId: string, args?: NavigationArgs) => {
      const { query = {}, ...otherArgs } = args ?? {}
      return router.push({
        pathname: EAdminRoutes.PARTNER_DETAILS,
        query: { partnerId, ...query },
        ...otherArgs,
      })
    },
    goToCouriers: (args?: NavigationArgs) => router.push({ pathname: EAdminRoutes.COURIERS, ...args }),
    goToCourierDetails: (courierId: string, args?: NavigationArgs) => {
      const { query = {}, ...otherArgs } = args ?? {}
      return router.push({
        pathname: EAdminRoutes.COURIER_DETAILS,
        query: { courierId, ...query },
        ...otherArgs,
      })
    },
    goToDeliveries: (args?: NavigationArgs) => router.push({ pathname: EAdminRoutes.DELIVERIES, ...args }),
    goToDeliveryDetails: (deliveryId: string, args?: NavigationArgs) => {
      const { query = {}, ...otherArgs } = args ?? {}
      return router.push({
        pathname: EAdminRoutes.DELIVERY_DETAILS,
        query: { deliveryId, ...query },
        ...otherArgs,
      })
    },
  }
}
