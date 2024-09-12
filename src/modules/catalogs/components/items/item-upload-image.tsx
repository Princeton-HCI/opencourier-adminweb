import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { CatalogItemAdminDto } from '../../../backend-admin-sdk'
import { PlusCircle, UploadCloud } from 'lucide-react'
import { useUploadItemImageMutation } from '@/api/catalogApi'

interface ItemUploadImageProps extends React.HTMLAttributes<HTMLDivElement> {
  item: CatalogItemAdminDto
  submitted?: (newItem: CatalogItemAdminDto) => void
}

export function ItemUploadImage({ item, submitted }: ItemUploadImageProps) {
  const [uploadImageMutation] = useUploadItemImageMutation()
  const onDrop = useCallback(async (files: Array<File>) => {
    if (files[0]) {
      const result = await uploadImageMutation({
        id: item.id,
        file: files[0],
      }).unwrap()
      submitted && submitted(result)
    }
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'images/jpeg': ['.jpg', '.jpeg'],
      'images/png': ['.png'],
      'image/svg+xml': ['.svg'],
      'images/webp': ['.webp'],
    },
  })

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        <div
          className="flex flex-col md:flex-row text-center md:text-left justify-between items-center py-[15px] px-[25px]"
          style={{
            border: '1px solid #d2d2d2',
            borderRadius: 8,
            backgroundColor: isDragActive ? '#eee' : 'transparent',
          }}
        >
          <div className="block mb-[10px] md:mb-0">
            <UploadCloud className="h-10 w-10" />
          </div>
          <div className="grow md:px-[15px]">
            <div style={{ fontSize: 14, fontWeight: 600 }}>Upload new image</div>
            <div className="mt-[5px]" style={{ fontSize: 12 }}>
              Accepted: JPG, PNG, SVG, or WEBP. Recommended size: 128 x 128 pixels.
            </div>
          </div>
          <div className="hidden md:block">
            <PlusCircle className="h-6 w-6" />
          </div>
        </div>
      }
    </div>
  )
}
