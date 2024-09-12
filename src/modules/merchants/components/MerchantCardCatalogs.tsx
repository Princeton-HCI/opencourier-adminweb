import { useGetMerchantCatalogsQuery } from '@/api/catalogApi'
import { useRefreshMenuMutation } from '@/api/merchantApi'
import { useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import { useCreateCatalogSheet } from '@/modules/catalogs/hook/sheet/useCreateCatalogSheet'
import { Button, Card, CardContent, CardHeader, CardTitle, DataTable, toast } from '../../../admin-web-components'
import { CatalogAdminDto, MerchantAdminDto, MerchantAdminDtoMenuProviderEnum } from '../../../backend-admin-sdk'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, RefreshCwIcon } from 'lucide-react'
import { useRouter } from 'next/router'

/** List of menu providers that require the menu to be refreshed manually. */
const REFRESH_MENU_PROVIDERS: MerchantAdminDtoMenuProviderEnum[] = ['CHECKMATE', 'CHOWLY']

export function MerchantCardCatalogs({ merchant }: { merchant: MerchantAdminDto }) {
  const router = useRouter()
  const merchantId = typeof router.query.merchantId === 'string' ? router.query.merchantId : ''
  const merchantGroupId = typeof router.query.merchantGroupId === 'string' ? router.query.merchantGroupId : ''
  const { data } = useGetMerchantCatalogsQuery({ merchantId: merchant.id })
  const [refreshMenuMutation, refreshMenuMutationState] = useRefreshMenuMutation()
  const { goToCatalogDetails } = useAdminPageNavigator()
  const createCatalogSheet = useCreateCatalogSheet({ merchant })

  const columns: ColumnDef<CatalogAdminDto>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorFn: (item) => (item.enabled ? 'Yes' : 'No'),
      header: 'Enabled',
    },
  ]

  const handleRefreshMenu = async () => {
    try {
      await refreshMenuMutation({ id: merchant.id }).unwrap()
      toast({
        title: 'Merchant updated',
        description: 'The merchant menu was successfully updated.',
      })
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update menus for merchant.',
        variant: 'destructive',
      })
    }
  }

  const providerRequiresMenuRefresh = REFRESH_MENU_PROVIDERS.includes(merchant.menuProvider)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
          <CardTitle className="flex flex-row place-content-between items-center">
            <div className="grow text-base md:text-xl">Catalogs</div>
            <div className="grow-0 space-x-2 flex flex-col md:flex-row items-end">
              {merchant.menuProvider === 'NOSH' ? (
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={createCatalogSheet.open}>
                  <Plus className="h-6 w-6" />
                </Button>
              ) : null}
              {providerRequiresMenuRefresh ? (
                <Button variant="secondary" disabled={refreshMenuMutationState.isLoading} onClick={handleRefreshMenu}>
                  <RefreshCwIcon className="h-5 w-5 mr-2" />
                  Re-sync with POS
                </Button>
              ) : null}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 overflow-scroll scrollbar-hide">
          <DataTable
            columns={columns}
            data={data || []}
            onRowClick={(catalog) => goToCatalogDetails(merchantGroupId, merchantId, catalog.id)}
          />
        </CardContent>
      </Card>
    </>
  )
}
