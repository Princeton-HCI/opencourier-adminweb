import { cn } from '../../../ui-shared-utils'
import { Avatar, AvatarFallback } from '../../../admin-web-components'
import InfiniteScroll from 'react-infinite-scroll-component'
import { NoshChat } from '../../../ui-shared-utils'
import { CHAT_ADMIN_ID } from '../constants'

interface MessageListProps {
  chat: NoshChat
}

export default function MessageList({ chat }: MessageListProps) {
  const messages = chat.openedConversation?.id ? chat.messages[chat.openedConversation.id] ?? [] : []

  return (
    <InfiniteScroll
      dataLength={messages.length}
      next={chat.loadMore}
      hasMore={chat.hasMore}
      loader={
        chat.loadingMore && <div className="flex col-span-full justify-center items-center space-x-2">Loading</div>
      }
      className="flex flex-col-reverse"
      scrollableTarget="scrollableDiv"
      inverse
    >
      {messages.map((message, index) => {
        const isSelf = message.author === CHAT_ADMIN_ID
        const name = message.authorName?.toUpperCase().split(' ') ?? []
        let avatarName = ''
        if (name.length === 1) {
          avatarName = `${name[0]?.charAt(0)}`
        } else if (name.length > 1) {
          avatarName = `${name[0]?.charAt(0)}${name[1]?.charAt(0)}`
        } else {
          avatarName = ''
        }

        return (
          <div
            key={index}
            className={cn('flex flex-col gap-2 p-4 whitespace-pre-wrap', isSelf ? 'items-end' : 'items-start')}
          >
            <div className="flex gap-3 items-center">
              {!isSelf && (
                <Avatar className="flex justify-center items-center">
                  <AvatarFallback>{avatarName}</AvatarFallback>
                </Avatar>
              )}
              <span className=" bg-accent p-3 rounded-md max-w-xs">{message.body}</span>
              {isSelf && (
                <Avatar className="flex justify-center items-center">
                  <AvatarFallback>{avatarName}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        )
      })}
    </InfiniteScroll>
  )
}
