import { useGetMerchantGroupDetailsQuery } from '../../api/merchantApi';
import { EAdminRoutes, Routes, useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import { useUpdateGroupSheet } from '@/modules/merchant-groups/hook/sheet/useUpdateGroupSheet'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	Tabs,
	TabsList,
	TabsTrigger,
} from '../../admin-web-components';
import { ArrowLeftIcon, PencilIcon, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/router'
import React from 'react'
import { useCreateOrganizationSheet } from '../../modules/merchant-organizations/hook/sheet/useCreateOrganizationSheet'

interface DefaultLayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MerchantGroupLayout({ children }: DefaultLayoutProps) {
  const { goToPartners } = useAdminPageNavigator()
  const router = useRouter()
  const groupId = typeof router.query.merchantGroupId === 'string' ? router.query.merchantGroupId : ''
  const createOrganizationSheet = useCreateOrganizationSheet({ groupId })

  const { data } = useGetMerchantGroupDetailsQuery({ id: groupId })
  const updateGroupSheet = useUpdateGroupSheet({ groupId, defaultValues: data })
  return (
    <div>
      <Button variant="link" className="p-0" onClick={() => goToMerchantGroups()}>
        <div className="bg-gray-100 rounded-full h-6 w-6 flex justify-center items-center mr-1">
          <ArrowLeftIcon className="w-4" />
        </div>
        Back to Merchants Groups
      </Button>

      {!data ? (
        <span>There was a problem </span>
      ) : (
        <>
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-center space-x-4 pt-2">
              <Avatar className="w-12 h-12">
                <AvatarImage src={data.logo} />
                {!data.logo && <AvatarFallback>VC</AvatarFallback>}
              </Avatar>
              <h2 className="text-2xl font-bold tracking-tight">{data.name}</h2>
            </div>
            <div>
              <Button className="mr-4" variant="secondary" onClick={updateGroupSheet.open}>
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="secondary" onClick={createOrganizationSheet.open}>
                <PlusIcon className="mr-2 h-4 w-4" />
                New organization
              </Button>
            </div>
          </div>

          <Tabs
            value={Routes.indexOf(router.pathname as EAdminRoutes).toString()}
            onValueChange={async (value) => {
              if (Routes[Number(value)] === EAdminRoutes.MERCHANTS) {
                await goToPartners()
              }
            }}
          >
            <TabsList>
              <TabsTrigger value={Routes.indexOf(EAdminRoutes.MERCHANTS).toString()}>Merchants</TabsTrigger>
            </TabsList>
          </Tabs>

          {children}
        </>
      )}
    </div>
  )
}
