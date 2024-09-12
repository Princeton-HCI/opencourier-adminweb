import { useDeleteItemImagesMutation } from '@/api/catalogApi'
import { ItemUploadImage } from '@/modules/catalogs/components/items/item-upload-image'
import { Icons, SheetContent, SheetDescription, SheetHeader, SheetTitle, useToast } from '../../../admin-web-components'
import { CatalogItemAdminDto, MerchantAdminDto } from '../../../backend-admin-sdk'
import { XCircle } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

interface ItemSheetImagesProps extends React.HTMLAttributes<HTMLDivElement> {
  merchant: MerchantAdminDto
  item: CatalogItemAdminDto
}

export function ItemSheetImages({ merchant, item }: ItemSheetImagesProps) {
  const [deleteImagesMutation, { isLoading: isLoadingDelete }] = useDeleteItemImagesMutation()
  const { toast } = useToast()

  const handleDeleteImage = async (imageUrl: string) => {
    if (isLoadingDelete || !confirm(`Delete image from "${item.name}"?`)) {
      return
    }

    try {
      await deleteImagesMutation({
        id: item.id,
        imageUrls: [imageUrl],
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to submit item',
        variant: 'destructive',
      })
    }
  }

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <div className="flex flex-col h-full space-y-4">
        <SheetHeader>
          <SheetTitle>Item Images</SheetTitle>
          <SheetDescription>Item: {item.name}</SheetDescription>
        </SheetHeader>
        {merchant.menuProvider === 'NOSH' ? <ItemUploadImage item={item}></ItemUploadImage> : null}
        {item.images.length !== 0 ? (
          item.images.map((image, i) => (
            <div
              key={`image-${i}`}
              className="flex flex-row items-center justify-between p-4"
              style={{ background: '#fbfbfb', border: '1px solid #e2e2e2', borderRadius: 8 }}
            >
              <Image
                unoptimized
                src={image}
                alt={`Image #${i}`}
                width={92}
                height={92}
                style={{ maxWidth: 92, maxHeight: 92 }}
              />
              {isLoadingDelete ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  {merchant.menuProvider === 'NOSH' ? (
                    <XCircle className="w-8 h-7 ml-2 cursor-pointer" onClick={() => handleDeleteImage(image)} />
                  ) : null}
                </>
              )}
            </div>
          ))
        ) : (
          <i>Item has no images.</i>
        )}
      </div>
    </SheetContent>
  )
}
