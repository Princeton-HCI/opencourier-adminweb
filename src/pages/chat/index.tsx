import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import ChatPage from '../../modules/chat/components/ChatPage'

export default function Chat() {
  return (
    <DefaultLayout className="p-0">
      <ChatPage />
    </DefaultLayout>
  )
}
