import { MerchantUploadCover } from '@/modules/merchants/components/merchant-upload-cover'
import { MerchantUploadLogo } from '@/modules/merchants/components/merchant-upload-logo'
import { Card, CardContent, CardHeader, CardTitle } from '../../../admin-web-components'
import { MerchantAdminDto } from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'

export function MerchantCardImages({ merchant }: { merchant: MerchantAdminDto }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  useEffect(() => {
    setLogoUrl(merchant.logo ?? null)
    setCoverUrl(merchant.coverImage ?? null)
  }, [merchant])

  return (
    <Card>
      <CardHeader className="md:text-xl">
        <CardTitle>Images</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6">
        <MerchantUploadLogo merchant={merchant} onChange={(newMerchant) => setLogoUrl(newMerchant.logo ?? '')} />
        {logoUrl ? (
          <div className="w-full">
            <img src={logoUrl} alt="Logo" className="max-w-full h-auto" style={{ maxHeight: 64 }} />
          </div>
        ) : null}
      </CardContent>

      <CardContent className="grid grid-cols-1 gap-6">
        <MerchantUploadCover
          merchant={merchant}
          onChange={(newMerchant) => setCoverUrl(newMerchant.coverImage ?? '')}
        />
        {coverUrl ? (
          <div className="w-full">
            <img src={coverUrl} alt="Cover image" className="max-w-full h-auto" style={{ maxHeight: 256 }} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
