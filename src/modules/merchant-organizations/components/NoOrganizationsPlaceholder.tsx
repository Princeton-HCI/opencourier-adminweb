import { PlusIcon } from 'lucide-react'
import { Button } from '../../../admin-web-components';
import { useCreateOrganizationSheet } from '../hook/sheet/useCreateOrganizationSheet'

export function NoOrganizationsPlaceholder({ groupId }: { groupId: string }) {
  const createOrganizationSheet = useCreateOrganizationSheet({ groupId })
  return (
    <div className="flex flex-col items-center mt-24">
      <div className="mb-8 text-center">
        Start by creating a new Merchant Organization.
        <br />
        This is a group of restaurants under the same brand and common payout account.
      </div>
      <Button onClick={createOrganizationSheet.open}>
        <PlusIcon className="mr-2 h-4 w-4" />
        New organization
      </Button>
    </div>
  )
}
