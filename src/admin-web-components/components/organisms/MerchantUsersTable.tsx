import { MerchantUserAdminDtoRoleEnum } from '../../../backend-admin-sdk';
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '../../../ui-shared-utils'
import { Badge } from '../atoms/Badge'
import { Icons } from '../atoms/Icons'
import { DataTable } from '../molecules/DataTable'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../molecules/DropdownMenu'

export type MerchantUsersTableMerchantUser = {
  id: string
  email: string | null
  role: Array<MerchantUserAdminDtoRoleEnum>
  merchant?: { id: string; name: string } | null
  password: string | null
}

type RoleBadgeProps = {
  role: MerchantUserAdminDtoRoleEnum
}
function RoleBadge(props: RoleBadgeProps) {
  const rolesColors: { [key in MerchantUserAdminDtoRoleEnum]: string } = {
    MERCHANT_GROUP_ADMIN: 'bg-orange-50',
    MERCHANT_LOCATION_MANAGER: 'bg-sky-50',
    ADMIN: 'bg-transparent',
    CUSTOMER: 'bg-transparent',
  }

  return (
    <Badge variant="outline" className={cn(rolesColors[props.role], 'capitalize')}>
      {props.role.split('_').join(' ').toLowerCase()}
    </Badge>
  )
}

type GetColumnsArgs = { updateUser: (defaultValues: MerchantUsersTableMerchantUser) => void }
const getColumns = ({ updateUser }: GetColumnsArgs): ColumnDef<MerchantUsersTableMerchantUser>[] => [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => row.original.role.map((role) => <RoleBadge role={role} />),
  },
  {
    accessorKey: 'merchant',
    header: 'Location',
    accessorFn: (v) => v.merchant?.name,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="sr-only">Open menu</span>
            <Icons.moreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" className="w-32">
            <DropdownMenuItem onClick={() => updateUser(row.original)}>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

type MerchantUsersTableProps = {
  data: MerchantUsersTableMerchantUser[]
  updateUser: (defaultValues: MerchantUsersTableMerchantUser) => void
}
export function MerchantUsersTable({ data, updateUser }: MerchantUsersTableProps) {
  return <DataTable columns={getColumns({ updateUser })} data={data} />
}
