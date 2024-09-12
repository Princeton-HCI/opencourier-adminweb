import { ChangeEvent, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../atoms/Avatar'
import { Input } from '../atoms/Input'
import { Label } from '../atoms/Label'

interface ImageUploaderProps {
  initialLogo?: string
  onImageUpload?: (file: File) => void
}

export const ImageUploader = ({ initialLogo, onImageUpload }: ImageUploaderProps) => {
  const [logo, setLogo] = useState<string>(initialLogo || 'https://github.com/vercel.png')

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null
    if (file && file.type.match('image.*')) {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setLogo(e.target.result as string) // image preview locally
          onImageUpload && onImageUpload(file)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex items-center justify-between space-x-4 pt-2">
      <Avatar className="w-12 h-12">
        <AvatarImage src={logo} />
        {!logo && <AvatarFallback>VC</AvatarFallback>}
      </Avatar>
      <div className="flex flex-col w-full items-start gap-1.5">
        <Label htmlFor="photo">Upload a logo</Label>
        <Input
          id="photo"
          type="file"
          onChange={handleFileChange}
          accept="image/*" // Accept only images
        />
      </div>
    </div>
  )
}
