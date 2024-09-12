import { useLazyGetChatTokenQuery } from '../../../api/authApi';
import useAppSelector from '@/hooks/useAppSelector'
import { setChatToken } from '@/modules/auth/slices/authSlice'
import { NoshChat, useAppDispatch, useChat } from '../../../ui-shared-utils';
import { ReactNode, createContext, useEffect } from 'react'
import { CHAT_ADMIN_ID } from '../constants'

export const ChatContext = createContext<NoshChat | null>(null)

export function ChatProvider(props: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const [getChatTokenQuery] = useLazyGetChatTokenQuery()

  const updateChatToken = async () => {
    const result = await getChatTokenQuery()
    if (!result.data?.chatToken) {
      console.error('[updateChatToken] was not able to load chat token.')
      return
    }

    dispatch(setChatToken(result.data.chatToken))
    return result.data.chatToken
  }

  const chat = useChat({ updateChatToken })
  const chatToken = useAppSelector((state) => state.auth.chatToken) ?? ''

  useEffect(() => {
    if (chatToken) chat.initialize(chatToken, CHAT_ADMIN_ID)
  }, [chatToken])

  return <ChatContext.Provider value={chat}>{props.children}</ChatContext.Provider>
}
