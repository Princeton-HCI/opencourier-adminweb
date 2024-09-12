import { useGetMerchantGroupDetailsQuery, useGetMerchantsByGroupQuery } from '@/api/merchantApi'
import { useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DataTable,
  TableLabeledImageCell,
} from '../../admin-web-components'
import { MerchantAdminDto } from '../../backend-admin-sdk'
import { Separator } from '@radix-ui/react-separator'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowLeftIcon } from 'lucide-react'
import { useRouter } from 'next/router'
import { HTMLAttributes } from 'react'

const columns: ColumnDef<Pick<MerchantAdminDto, 'id' | 'name' | 'logo'>>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <TableLabeledImageCell label={row.original.name} src={row.original.logo} />,
  },
]

function MerchantPageContainerAside() {
  const { goToPartnerDetails } = useAdminPageNavigator()
  const router = useRouter()
  const groupId = typeof router.query.merchantGroupId === 'string' ? router.query.merchantGroupId : ''
  const { data } = useGetMerchantGroupDetailsQuery({ id: groupId })
  const merchants = useGetMerchantsByGroupQuery({ groupId, page: 1, perPage: 20 })

  return (
    <>
      <Button variant="link" className="p-0">
        <div className="bg-gray-100 rounded-full h-6 w-6 flex justify-center items-center mr-1">
          <ArrowLeftIcon className="w-4" />
        </div>
        Back to Merchants Groups
      </Button>

      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center space-x-4 pt-2">
          <Avatar className="w-12 h-12">
            <AvatarImage src={data?.logo} />
            {!data?.logo && <AvatarFallback>VC</AvatarFallback>}
          </Avatar>
          <h5 className="text-md font-bold tracking-tight">{data?.name}</h5>
        </div>
      </div>

      <br />

      <h5 className="text-md font-medium tracking-tight">{merchants.data?.pagination?.totalItems} Merchants</h5>

      <br />

      <DataTable
        columns={columns}
        data={merchants.data?.data ?? []}
        onRowClick={(merchant) => goToPartnerDetails(merchant.id)}
        hideHeader
      />

      <Separator orientation="vertical" />
    </>
  )
}

export function MerchantLayout({ children }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="md:grid md:grid-cols-3">
      <div className="hidden md:block md:col-span-1 md:max-h-screen md:border-r-[1px] md:border-b-gray-50 md:p-4">
        <MerchantPageContainerAside />
      </div>

      <div className="md:col-span-2 max-h-screen overflow-auto p-4">{children}</div>
    </div>
  )
}
