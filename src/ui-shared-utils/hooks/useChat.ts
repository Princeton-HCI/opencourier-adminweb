import {
  Client,
  Conversation,
  DeliveryAmount,
  JSONValue,
  Message,
  Paginator,
  Participant,
  ParticipantType,
  User,
} from '@twilio/conversations'
import { useEffect, useCallback, useState, useRef } from 'react'
import sum from 'lodash/sum'

const ADMIN_ID = 'NOSH_ADMIN'

export type NoshConversation = {
  id: string
  orderId: string | null
  name: string | null
  dateUpdated: Date | null
  lastReadMessageIndex: number | null
  lastMessage?: {
    index?: number
    dateCreated?: Date
  }
}

export type NoshMessage = {
  id: string
  index: number
  body: string | null
  author: string | null
  authorName: string | null
  attributes: JSONValue
  participantSid: string | null
  dateCreated: Date | null
  aggregatedDeliveryReceipt: {
    total: number
    sent: DeliveryAmount
    delivered: DeliveryAmount
    read: DeliveryAmount
    undelivered: DeliveryAmount
    failed: DeliveryAmount
  } | null
}

const conversationSorter = (a: NoshConversation, b: NoshConversation) =>
  (b.lastMessage?.dateCreated?.getTime() ?? b.dateUpdated?.getTime() ?? 0) -
  (a.lastMessage?.dateCreated?.getTime() ?? a.dateUpdated?.getTime() ?? 0)

const toNoshConversation = (c: Conversation): NoshConversation => ({
  id: c.sid,
  name: c.friendlyName,
  orderId: c.uniqueName,
  dateUpdated: c.dateUpdated,
  lastMessage: c.lastMessage,
  lastReadMessageIndex: c.lastReadMessageIndex,
})

const toNoshMessage = (message: Message, authorName: string): NoshMessage => ({
  id: message.sid,
  index: message.index,
  body: message.body,
  author: message.author,
  authorName,
  participantSid: message.participantSid,
  attributes: message.attributes,
  dateCreated: message.dateCreated,
  aggregatedDeliveryReceipt: message.aggregatedDeliveryReceipt
    ? {
        total: message.aggregatedDeliveryReceipt.total,
        sent: message.aggregatedDeliveryReceipt.sent,
        delivered: message.aggregatedDeliveryReceipt.delivered,
        read: message.aggregatedDeliveryReceipt.read,
        undelivered: message.aggregatedDeliveryReceipt.undelivered,
        failed: message.aggregatedDeliveryReceipt.failed,
      }
    : null,
})

type NoshParticipant = {
  sid: string
  attributes: JSONValue
  identity: string | null
  type: ParticipantType
  lastReadMessageIndex: number | null
}
const toNoshParticipant = (participant: Participant): NoshParticipant => ({
  sid: participant.sid,
  attributes: participant.attributes,
  identity: participant.identity,
  type: participant.type,
  lastReadMessageIndex: participant.lastReadMessageIndex,
})

type NoshUser = {
  id: string
  attributes: JSONValue
  identity: string | null
  friendlyName: string | null
}
const toNoshUser = (user: User): NoshUser => ({
  id: user.identity,
  attributes: user.attributes,
  friendlyName: user.friendlyName,
  identity: user.identity,
})

const conversationsMap = new Map<string, Conversation>()

type UseChatArgs = {
  updateChatToken: () => Promise<string | undefined>
  onMessageAdded?: (newMessage: NoshMessage) => void
}
export function useChat({ updateChatToken, onMessageAdded }: UseChatArgs) {
  // const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<Client>()
  const [conversations, setConversations] = useState<NoshConversation[]>([])
  const [participants, setParticipants] = useState<Record<string, NoshParticipant[]>>({})
  const [openedConversation, setOpenedConversation] = useState<NoshConversation | null>()
  const [openedConversationId, setOpenedConversationId] = useState<string | null>()
  const [messages, setMessages] = useState<Record<string, NoshMessage[] | null>>({})
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number | null>>({})
  const [users, setUsers] = useState<Record<string, User[] | null>>({})
  const [paginator, setPaginator] = useState<Paginator<Message> | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const currentConversationId = useRef<string>()
  currentConversationId.current = openedConversation?.id

  const addMessages = useCallback(
    (conversationId: string, messagesToAdd: NoshMessage[]) => {
      const existingMessages = messages[conversationId] ?? []

      const filteredExistingMessages = existingMessages.filter((message) => {
        return !messagesToAdd.find(
          (value) =>
            value.body === message.body &&
            value.author === message.author &&
            (message.index === -1 || value.index === message.index)
        )
      })

      //add new messages to existing, ignore duplicates
      const messagesUnique = [...filteredExistingMessages, ...messagesToAdd]

      const sortedMessages = messagesUnique.sort((a, b) => {
        return a.index - b.index
      })

      sortedMessages.reverse()

      //overwrite the conversation messages
      return setMessages((state) => ({
        ...state,
        [conversationId]: sortedMessages,
      }))
    },
    [messages]
  )

  const upsertConversation = (conversation: Conversation) => {
    conversationsMap.set(conversation.sid, conversation)

    const opencourierConversation = toNoshConversation(conversation)
    setConversations((state) => {
      const filteredClone = state.filter((c) => c.id !== opencourierConversation.id)
      const updatedConversations = [...filteredClone, opencourierConversation].sort(conversationSorter)
      return updatedConversations
    })
  }

  const updateUnreadMessages = async (message: Message) => {
    const conversationId = message.conversation.sid
    const conversation = conversationsMap.get(conversationId)
    if (!conversation) return

    if (currentConversationId.current === conversationId) {
      await conversation.advanceLastReadMessageIndex(message.index)
    }

    if (currentConversationId.current !== conversation.sid) {
      const unreadMessagesCount = await conversation.getUnreadMessagesCount()
      setUnreadMessages((state) => ({ ...state, [conversation.sid]: unreadMessagesCount }))
    }
  }

  useEffect(() => {
    const conversation = conversations.find((con) => con.id === openedConversationId)
    if (conversation) {
      setOpenedConversation(conversation)
    }
  }, [openedConversationId, conversations])

  const loading = !client

  const allUnreadMessagesCount = sum(
    Object.values(unreadMessages)
      .map((v) => v)
      .filter(Boolean)
  )

  return {
    conversations,
    participants,
    openedConversation,
    setOpenedConversationId,
    messages,
    unreadMessages,
    allUnreadMessagesCount,
    loading,
    loadingMore,
    hasMore,
    users,

    initialize(chatToken: string, hostIdentity: string) {
      const clientInstance = new Client(chatToken)

      clientInstance.on('connectionStateChanged', (state) => {
        if (state === 'connected') {
          setClient(clientInstance)
        }
      })

      /** Get the list of conversations from socket. */
      clientInstance.on('conversationJoined', async (conversation) => {
        conversationsMap.set(conversation.sid, conversation)

        setConversations(
          Array.from(conversationsMap)
            .map(([_, c]) => toNoshConversation(c))
            .sort(conversationSorter)
        )

        if (conversation.status === 'joined') {
          const conversationParticipants = await conversation.getParticipants()
          setParticipants((state) => ({
            ...state,
            [conversation.sid]: conversationParticipants.map(toNoshParticipant),
          }))

          const conversationUsers = await Promise.all(conversationParticipants.map((p) => p.getUser()))
          setUsers((currentUsers) => ({ ...currentUsers, [conversation.sid]: conversationUsers }))

          const conversationMessages = await conversation.getMessages()
          addMessages(
            conversation.sid,
            conversationMessages.items.map((m) =>
              toNoshMessage(m, conversationUsers.find((u) => u.identity === m.author)?.friendlyName ?? '')
            )
          )
          const unreadMessagesCount = await conversation.getUnreadMessagesCount()
          setUnreadMessages((state) => ({ ...state, [conversation.sid]: unreadMessagesCount }))
        }
      })

      clientInstance.on('conversationUpdated', ({ conversation }) => {
        upsertConversation(conversation)
      })

      clientInstance.on('tokenAboutToExpire', async () => {
        try {
          const token = await updateChatToken()
          if (!token) throw new Error('Error fetching the token.')
          await clientInstance.updateToken(token)
        } catch (err) {
          console.error('[tokenAboutToExpire] There was a problem updating the chat token.', err)
        }
      })

      clientInstance.on('tokenExpired', async () => {
        try {
          await updateChatToken()
        } catch (err) {
          console.error('[tokenExpired] There was a problem updating the chat token.', err)
        }
      })

      clientInstance.on('messageAdded', async (message: Message) => {
        const participant = await message.getParticipant()
        const user = await participant.getUser()
        const newMessage = toNoshMessage(message, user.friendlyName ?? '')
        setMessages((currentMessages) => {
          const conversationMessages = currentMessages[message.conversation.sid] ?? []
          conversationMessages.unshift(newMessage)
          return {
            ...currentMessages,
            [message.conversation.sid]: conversationMessages,
          }
        })

        if (message.author !== hostIdentity) await updateUnreadMessages(message)

        onMessageAdded?.(newMessage)
      })
    },

    async getConversationByOrderId(orderId: string) {
      try {
        if (!client) throw new Error('no client.')
        const c = (await client.getConversationByUniqueName(orderId)) as Conversation | undefined
        if (!c) {
          console.error(`[getConversationByOrderId] conversation with id ${orderId} not found.`)
          return
        }
        return toNoshConversation(c)
      } catch (err) {
        console.error('[getConversationByOrderId] Unexpected error', err)
        return
      }
    },

    async createConversation(args: { role: 'ADMIN' | 'CUSTOMER'; orderId: string; name: string }) {
      try {
        if (!client) throw new Error('no client')
        // console.log('creating convo')
        const conversation = await client.createConversation({ uniqueName: args.orderId, friendlyName: args.name })
        // console.log(JSON.stringify(pick(conversation, ['sid', 'state', 'status', 'uniqueName'])))

        // console.log('joining conversation')
        await conversation.join()
        if (args.role !== 'ADMIN') {
          // console.log('adding admin')
          await conversation.add(ADMIN_ID)
        }
        // console.log('get participants')
        const conversationParticipants = await conversation.getParticipants()
        // console.log('updating state')
        setParticipants((state) => ({ ...state, [conversation.sid]: conversationParticipants.map(toNoshParticipant) }))

        return toNoshConversation(conversation)
      } catch (err) {
        console.error(`[createConversation] Unexpected error ${err}`) // TODO. handle error.
        if (err instanceof Error) {
          console.error(JSON.stringify(err.stack))
        }
        return
      }
    },

    async loadConversationMessages(conversationId: string) {
      const conversation = conversationsMap.get(conversationId)
      if (!conversation) {
        console.error('[loadConversationMessages] Unexpected error, no conversation.') // TODO. handle error.
        return
      }

      const result = await conversation.getMessages(20)
      const conversationParticipants = await conversation.getParticipants()
      const conversationUsers = await Promise.all(conversationParticipants.map((p) => p.getUser()))
      const conversationMessages = result.items.map((m) =>
        toNoshMessage(m, conversationUsers.find((u) => u.identity === m.author)?.friendlyName ?? '')
      )

      setHasMore(result.hasPrevPage)
      setPaginator(result)
      setUsers((currentUsers) => ({ ...currentUsers, [conversation.sid]: conversationUsers }))
      addMessages(conversation.sid, conversationMessages)
    },

    async loadMore() {
      if (loading || !hasMore) return

      try {
        setLoadingMore(true)
        if (!paginator) {
          throw new Error('[loadMore] Unexpected error, no paginator.')
        }
        if (!openedConversation) {
          throw new Error('[loadMore] Unexpected error, no conversation.')
        }

        const result = (await paginator.prevPage()) as Paginator<Message> | undefined
        if (!result) {
          throw new Error('[loadMore] Result not found.')
        }

        const moreMessages = result.items
        addMessages(
          openedConversation.id,
          moreMessages.map((message) =>
            toNoshMessage(
              message,
              users[openedConversation.id]?.find((u) => u.identity === message.author)?.friendlyName ?? ''
            )
          )
        )

        setPaginator(result)
        setHasMore(result.hasPrevPage)
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingMore(false)
      }
    },

    async sendMessage(conversationId: string, msg: string) {
      const conversation = conversationsMap.get(conversationId)

      if (!conversation) {
        console.error('[sendMessage] Unexpected error, no conversation.') // TODO. handle error.
        return
      }

      await conversation
        .prepareMessage()
        .setBody(msg)
        .build()
        .send()
        .catch((e) => {
          console.error(`[sendMessage] Error ${e}.`) // TODO. handle error.
        })
    },

    async setAllMessagesRead(conversationId: string) {
      const conversation = conversationsMap.get(conversationId)
      if (!conversation) return
      await conversation.setAllMessagesRead()
      setUnreadMessages((state) => ({ ...state, [conversationId]: 0 }))
    },

    disconnect() {
      client?.removeAllListeners()
    },
  }
}

export type NoshChat = ReturnType<typeof useChat>
