import { useGetDeliveriesQuery } from '@/api/deliveriesApi'
import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import { useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import { DeliveriesFilters, DeliveriesTableFilters } from '@/modules/deliveries/components/DeliveriesTableFilters'
import { StatusBadge } from '@/modules/deliveries/components/StatusBadge'
import { DEFAULT_PAGE_SIZE, DataTable } from '../../admin-web-components'
import { DeliveryAdminDto } from '../../backend-admin-sdk'
import { formatDate } from '../../ui-shared-utils'
import { ColumnDef, PaginationState } from '@tanstack/react-table'
import type { NextPage } from 'next'
import { useState } from 'react'

const columns: ColumnDef<DeliveryAdminDto>[] = [
  {
    accessorKey: 'id',
    header: 'Delivery ID',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  // {
  //   header: 'Merchant',
  //   accessorFn: ({ merchant }) => (merchant ? merchant.name : 'N/A'),
  // },
  // {
  //   header: 'Customer',
  //   accessorFn: ({ customer }) => (customer ? `${customer.firstName} ${customer.lastName}` : 'N/A'),
  // },
  // {
  //   header: 'Customer Phone',
  //   accessorFn: ({ customer }) => (customer && customer.cellPhone ? formatPhone(customer.cellPhone) : 'N/A'),
  // },
  {
    header: 'Created At',
    accessorFn: ({ createdAt }) => formatDate(createdAt),
  },
  // {
  //   header: 'Subtotal',
  //   accessorFn: ({ cost }) => (cost ? `$${formatPennies(cost.subtotalAmount)}` : 'N/A'),
  // },
]

const OrdersPage: NextPage = () => {
  const { goToDeliveryDetails } = useAdminPageNavigator()
  const [filters, setFilters] = useState<DeliveriesFilters>()
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const getOrdersResponse = useGetDeliveriesQuery({
    state: filters?.state,
    search: filters?.search,
    // merchantId: filters?.merchant,
    // customerId: filters?.customer,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  return (
    <DefaultLayout>
      <h2 className="text-3xl font-medium tracking-tight">Orders</h2>

      <DeliveriesTableFilters
        onFiltersChange={(newFilters) => {
          setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }))
          setPagination({ pageSize: DEFAULT_PAGE_SIZE, pageIndex: 0 })
        }}
      />

      <DataTable
        columns={columns}
        data={getOrdersResponse.data?.data ?? []}
        serverPagination={true}
        pagination={pagination}
        onPaginationChange={setPagination}
        totalCount={getOrdersResponse.data?.pagination?.totalItems ?? 0}
        onRowClick={(order) => goToDeliveryDetails(order.id)}
      />
    </DefaultLayout>
  )
}

export default OrdersPage
