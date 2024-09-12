import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import ChatPage from '../../../modules/chat/components/ChatPage'
import { useRouter } from 'next/router'

export default function Chat() {
  const router = useRouter()
  const conversationId = router.query.conversationId as string
  return (
    <DefaultLayout className="p-0">
      <ChatPage conversationId={conversationId} />
    </DefaultLayout>
  )
}
