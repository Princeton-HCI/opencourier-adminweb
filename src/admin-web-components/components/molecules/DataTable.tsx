import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type OnChangeFn,
  type PaginationState,
  type TableOptions,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
} from '../atoms/Table'

type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[]
  onRowClick?: (value: TData) => void
  data: TData[]
  hideHeader?: boolean
  serverPagination?: boolean
} & (
  | {
      serverPagination: true
      pagination: PaginationState
      onPaginationChange?: OnChangeFn<PaginationState>
      totalCount: number
      pageSize?: number
    }
  | { serverPagination?: never; pageSize?: number }
)

interface ObjectWithId {
  id: string
}

export const DEFAULT_PAGE_SIZE = 10

export function DataTable<TData extends ObjectWithId>({
  columns,
  data,
  onRowClick,
  hideHeader = false,
  ...props
}: DataTableProps<TData>) {
  const options: TableOptions<TData> = {
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
  }

  if (props.serverPagination) {
    if (!options.state) {
      options.state = {
        pagination: props.pagination,
      }
    } else {
      options.state.pagination = props.pagination
    }
    options.onPaginationChange = props.onPaginationChange
    options.manualPagination = true
    options.pageCount = props.totalCount ? Math.ceil(props.totalCount / (props.pageSize ?? DEFAULT_PAGE_SIZE)) : -1
  } else {
    if (props.pageSize) {
      const pagination = { pageIndex: 0, pageSize: props.pageSize }
      if (!options.state) {
        options.state = {
          pagination,
        }
      } else {
        options.state.pagination = pagination
      }
    }
    options.manualPagination = false
    options.getPaginationRowModel = getPaginationRowModel()
  }

  const table = useReactTable(options)

  return (
    <div>
      <Table>
        {hideHeader ? null : (
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
        )}
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => {
              const clickable = !!onRowClick
              return (
                <TableRow
                  className={clickable ? 'cursor-pointer hover:bg-gray-50/50' : ''}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  data-clickable={clickable}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        {table.getPageCount() > 1 ? (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length}>
                <TablePagination
                  pageIndex={table.getState().pagination.pageIndex}
                  pageCount={table.getPageCount()}
                  canPreviousPage={table.getCanPreviousPage()}
                  canNextPage={table.getCanNextPage()}
                  previousPage={() => table.previousPage()}
                  nextPage={() => table.nextPage()}
                  setPageIndex={(idx) => table.setPageIndex(idx)}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>
    </div>
  )
}
