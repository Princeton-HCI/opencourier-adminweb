import { useState, createContext, useContext } from 'react'
import { Realtime, Types } from 'ably/promises'
import { NotificationEventType } from '../../shared-types';
import { DeliveryAdminDto } from '../../backend-admin-sdk';

type NotificationEvent = DeliveryAdminDto
type EventCallback<T extends NotificationEvent> = (eventData: T) => void
type ParseFunction<T> = (data: string) => T

type WebSocketContextType = {
  ably: Realtime | null
  connectWebSocket: (accessToken: string) => void
  disconnectWebSocket: () => void
  subscribeToEvent: <T extends NotificationEvent>(
    channelName: string,
    eventType: NotificationEventType,
    callback: EventCallback<T>,
    parseFunction?: ParseFunction<T>
  ) => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

type WebSocketProviderProps = {
  children: React.ReactNode
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [ably, setWebSocket] = useState<Realtime | null>(null)

  //TODO replace key:key with Ivan token service
  const connectWebSocket = (accessToken: string) => {
    if (!ably) {
      const newWebSocket = new Realtime.Promise({
        authCallback: async (tokenParams, callback) => {
          try {
            console.log(`WebSocket: Requesting refreshed token`)
            // const tokenRequest = await 
            callback(null, accessToken)
          } catch (error) {
            console.error(`WebSocket: refreshed token error ${error}`)
            callback(error as Types.ErrorInfo, null)
          }
        },
      })

      newWebSocket.connection.on((stateChange) => {
        console.log(`WebSocket connection state change: ${stateChange.current}`)
      })

      setWebSocket(newWebSocket)
    } else {
      ably.connect()
    }
  }

  const disconnectWebSocket = () => {
    console.log('Disconnecting ably')
    ably?.close()
  }

  const subscribeToEvent = async <T extends NotificationEvent>(
    channelName: string,
    eventType: NotificationEventType,
    callback: EventCallback<T>,
    parseFunction?: ParseFunction<T>
  ) => {
    if (!ably) {
      return
    }

    const channel = ably.channels.get(channelName)
    await channel.subscribe(eventType, (msg: Types.Message) => {
      try {
        const eventData = parseFunction ? (parseFunction(msg.data) as T) : (JSON.parse(JSON.stringify(msg.data)) as T)
        callback(eventData)
      } catch (e) {
        console.error('Error parsing event data for msg: ', `${JSON.stringify(msg.data)}`, JSON.stringify(e))
      }
    })
  }

  return (
    <WebSocketContext.Provider value={{ ably, connectWebSocket, disconnectWebSocket, subscribeToEvent }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within an WebSocketProvider')
  }
  return context
}
