import { EAdminRoutes, Routes, useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import { Tabs, TabsList, TabsTrigger } from '../../admin-web-components';
import { useRouter } from 'next/router'
import React from 'react'

interface DefaultLayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MerchantGroupsLayout({ children }: DefaultLayoutProps) {
  const router = useRouter()
  const { goToMerchantCustomGroups, goToMerchantGroups } = useAdminPageNavigator()
  return (
    <>
      <Tabs
        value={Routes.indexOf(router.pathname as EAdminRoutes).toString()}
        onValueChange={async (value) => {
          if (Routes[Number(value)] === EAdminRoutes.MERCHANT_GROUPS) {
            await goToMerchantGroups()
          } else if (Routes[Number(value)] === EAdminRoutes.MERCHANT_CUSTOM_GROUPS) {
            await goToMerchantCustomGroups()
          }
        }}
      >
        <TabsList>
          <TabsTrigger value={Routes.indexOf(EAdminRoutes.MERCHANT_GROUPS).toString()}>Merchant Groups</TabsTrigger>
          <TabsTrigger value={Routes.indexOf(EAdminRoutes.MERCHANT_CUSTOM_GROUPS).toString()}>
            Merchant Custom Groups
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {children}
    </>
  )
}
