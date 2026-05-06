import { useGetCouriersQuery } from '@/api/couriersApi'
import { useGetDeliveriesQuery } from '@/api/deliveriesApi'
import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import { useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import { AssignCourierCell } from '@/modules/deliveries/components/AssignCourierCell'
import { DeliveriesFilters, DeliveriesTableFilters } from '@/modules/deliveries/components/DeliveriesTableFilters'
import { StatusBadge } from '@/modules/deliveries/components/StatusBadge'
import { DEFAULT_PAGE_SIZE, DataTable } from '../../admin-web-components'
import { DeliveryAdminDto } from '../../backend-admin-sdk'
import { EnumDeliveryStatus } from '../../shared-types'
import { formatDate } from '../../ui-shared-utils'
import { ColumnDef, PaginationState } from '@tanstack/react-table'
import type { NextPage } from 'next'
import { useMemo, useState } from 'react'

function CourierResolvedName({
  courierId,
  nameById,
}: {
  courierId: string
  nameById: Map<string, string>
}) {
  const name = nameById.get(courierId)
  if (name) {
    return <span className="break-words text-sm">{name}</span>
  }
  return <span className="break-all font-mono text-xs text-muted-foreground">{courierId}</span>
}

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
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const { data: couriersPayload } = useGetCouriersQuery({ page: 1, perPage: 500 })

  const courierNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of couriersPayload?.data ?? []) {
      const label = `${c.firstName} ${c.lastName}`.trim()
      map.set(c.id, label || c.id)
    }
    return map
  }, [couriersPayload?.data])

  const columns: ColumnDef<DeliveryAdminDto>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Delivery ID',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'courierId',
        header: 'Courier',
        cell: ({ row }) => {
          const d = row.original
          const isAssigning = d.status === EnumDeliveryStatus.ASSIGNING_COURIER
          return (
            <div
              className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="min-w-0">
                {isAssigning ? (
                  <span className="text-xs leading-snug text-muted-foreground">
                    Waiting for response from courier{' '}
                    <span className="text-foreground">
                      {d.matchedCourierId ? (
                        <CourierResolvedName courierId={d.matchedCourierId} nameById={courierNameById} />
                      ) : (
                        '—'
                      )}
                    </span>
                  </span>
                ) : d.courierId ? (
                  <CourierResolvedName courierId={d.courierId} nameById={courierNameById} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <AssignCourierCell delivery={d} />
            </div>
          )
        },
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
    ],
    [courierNameById],
  )

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
