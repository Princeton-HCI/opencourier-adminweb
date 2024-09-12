import { useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import { Badge, Input, ScrollArea } from '../../../admin-web-components'
import { NoshChat, cn } from '../../../ui-shared-utils'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Search } from 'lucide-react'
import { useState } from 'react'
dayjs.extend(relativeTime)

type ChatsListProps = {
  chat: NoshChat
  className?: string
}

export default function ChatsList({ chat, className }: ChatsListProps) {
  const { goToChatDetails } = useAdminPageNavigator()
  const [search, setSearch] = useState('')
  const conversations = chat.conversations.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className={cn('border-r-[1px] max-h-screen grid grid-rows-12', className)}>
      <div className="row-span-1 pt-4 px-4 border-b-[1px]">
        <h1 className="text-xl font-bold">Inbox</h1>
      </div>

      <div className="row-span-1 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="pl-8"
            />
          </div>
        </form>
      </div>

      <ScrollArea className="row-span-10">
        <div className="flex flex-col gap-2 p-4 pt-0">
          {conversations.map((conversation) => {
            const lastMessage = chat.messages[conversation.id]?.[0]
            const unreadMessagesCount = chat.unreadMessages[conversation.id]
            return (
              <button
                key={conversation.id}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
                  chat.openedConversation?.id === conversation.id && 'bg-muted'
                )}
                onClick={async () => goToChatDetails(conversation.id)}
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex w-full items-center justify-between">
                    <div className="font-semibold">{conversation.name}</div>
                    {unreadMessagesCount ? <Badge>{unreadMessagesCount}</Badge> : null}
                  </div>
                </div>

                <div className="flex w-full justify-between">
                  <div className="w-2/3">
                    <p className="line-clamp-2 text-xs text-muted-foreground">{lastMessage?.body}</p>
                  </div>

                  {lastMessage?.dateCreated ? (
                    <div
                      className={cn(
                        'ml-auto text-xs',
                        chat.openedConversation?.id === conversation.id ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {dayjs(lastMessage.dateCreated).fromNow()}
                    </div>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
