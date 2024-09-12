import { useContext, useEffect } from 'react'
import { Chat } from './Chat'
import { ChatContext } from './ChatProvider'
import ChatsList from './ChatsList'

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  conversationId?: string
}

export default function ChatPage({ conversationId }: LayoutProps) {
  const chat = useContext(ChatContext)

  useEffect(() => {
    if (chat && conversationId) {
      chat.setOpenedConversationId(conversationId)
      chat
        .loadConversationMessages(conversationId)
        .then(() => {
          return chat.setAllMessagesRead(conversationId)
        })
        .catch(console.error)
    }
  }, [conversationId, chat])

  return chat ? (
    <div className="grid grid-cols-3">
      <ChatsList chat={chat} className={chat.openedConversation ? 'col-span-1' : 'col-span-3'} />

      {chat.openedConversation ? <Chat chat={chat} className="col-span-2" /> : null}
    </div>
  ) : (
    <span>Loading</span>
  )
}
