import { useGetOrderQuery } from '@/api/deliveriesApi'
import { useOrderDetailsSheet } from '@/modules/orders/hooks/sheet/useOrderDetailsSheet'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, FormField, FormItem, Input } from '../../../admin-web-components'
import { cn } from '../../../ui-shared-utils'
import { NoshChat } from '../../../ui-shared-utils'
import { SendHorizontal } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import MessageList from './MessageList'

interface ChatProps {
  chat: NoshChat
  className?: string
}

const conversationMessageSchema = z.object({
  message: z.string(),
})

export function Chat({ chat, className }: ChatProps) {
  const { data: order } = useGetOrderQuery({ id: chat.openedConversation?.orderId ?? '' })
  const orderDetailsSheet = useOrderDetailsSheet()
  const form = useForm<z.infer<typeof conversationMessageSchema>>({
    resolver: zodResolver(conversationMessageSchema),
    defaultValues: { message: '' },
  })
  const message = form.watch('message')

  return chat.openedConversation && order ? (
    <div className={cn('max-h-screen grid grid-rows-12', className)}>
      <div className="row-span-1 flex items-center px-4 pt-2 justify-between border-b-[1px]">
        <h1 className="text-xl font-bold">{chat.openedConversation.name}</h1>
        <Button onClick={() => orderDetailsSheet.open({ orderId: order.id })}>View Order Details</Button>
      </div>

      <div id="scrollableDiv" className="row-span-10 overflow-auto flex flex-col-reverse">
        <MessageList chat={chat} />
      </div>

      <div className="row-span-1 px-4 py-1">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              if (!chat.openedConversation?.id) return
              await chat.sendMessage(chat.openedConversation.id, values.message)
              form.reset()
            })}
            className="flex"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => {
                return (
                  <FormItem className="flex-1">
                    <Input type="text" placeholder="Type a message" {...field} />
                  </FormItem>
                )
              }}
            />

            <Button type="submit" variant="ghost" size="icon" className="ml-4" disabled={!message}>
              <SendHorizontal className="text-muted-foreground" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  ) : null
}
