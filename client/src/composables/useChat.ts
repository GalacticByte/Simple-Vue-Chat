import { ref, readonly } from 'vue'
import { io, Socket } from 'socket.io-client'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  MessageDTO,
  UserDTO,
} from '@app/shared'

// The socket is created outside the function to ensure a single instance (singleton) for the entire application.

// ---------- Local ------------
// const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
//   import.meta.env.VITE_SERVER_URL || 'http://192.168.0.52:3000',
//   {
//     transports: ['websocket'],
//     autoConnect: false, // Do not connect automatically, wait for connect() call with token
//   },
// )

// ----------- Prod ----------------
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
  transports: ['websocket'],
  autoConnect: false, // Do not connect automatically, wait for connect() call with token
})

// =======================
// Singleton: state
// =======================
const messages = ref<MessageDTO[]>([])
const users = ref<UserDTO[]>([])
const isConnected = ref(false)
const typingUsers = ref<UserDTO[]>([])

let listenersRegistered = false

const setTyping = (isTyping: boolean) => {
  socket.emit('isTyping', { isTyping })
}

// =======================
// Internal: listeners
// =======================
const registerListeners = () => {
  if (listenersRegistered) return

  socket.on('connect', () => {
    isConnected.value = true
  })

  socket.on('disconnect', () => {
    isConnected.value = false
  })

  socket.on(
    'initChat',
    (data: { messages: MessageDTO[]; users: UserDTO[] }) => {
      messages.value = data.messages
      users.value = data.users
      typingUsers.value = []
      setTyping(false)
    },
  )

  socket.on('newMessage', (data: MessageDTO) => {
    messages.value.push(data)
  })

  socket.on('messageDeleted', ({ messageId }: { messageId: string }) => {
    messages.value = messages.value.filter(
      (m: MessageDTO) => m.id !== messageId,
    )
  })

  socket.on('userConnected', (data: UserDTO) => {
    if (!users.value.find((u: UserDTO) => u.id === data.id)) {
      users.value.push(data)
    }
  })

  socket.on('userDisconnected', (data: UserDTO) => {
    users.value = users.value.filter((u: UserDTO) => u.id !== data.id)
    typingUsers.value = typingUsers.value.filter(
      (u: UserDTO) => u.id !== data.id,
    )
  })

  socket.on(
    'isTyping',
    ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      const user = users.value.find((u: UserDTO) => u.id === userId)
      if (!user) return

      if (isTyping) {
        if (!typingUsers.value.some((u: UserDTO) => u.id === userId)) {
          typingUsers.value.push(user)
        }
      } else {
        typingUsers.value = typingUsers.value.filter(
          (u: UserDTO) => u.id !== userId,
        )
      }
    },
  )

  listenersRegistered = true
}

// =======================
// Public composable
// =======================
/**
 * Main composable for chat functionality.
 * Manages socket connection, state, and event listeners.
 */
export function useChat() {
  // Register listeners only once
  registerListeners()

  /**
   * Connects to the socket server with the provided authentication token.
   * @param token JWT token for authentication
   */
  const connect = (token: string) => {
    socket.auth = { token }
    socket.connect()
  }

  /**
   * Sends a new message to the chat.
   * @param message Content of the message
   */
  const sendMessage = (message: string) => {
    socket.emit('newMessage', { message })
  }
  /**
   * Requests deletion of a message by ID.
   * @param messageId ID of the message to delete
   */
  const messageDeleted = (messageId: string) => {
    socket.emit('deleteMessage', { messageId })
  }

  /**
   * Disconnects the socket and resets the chat state.
   */
  const disconnect = () => {
    socket.disconnect()
    messages.value = []
    isConnected.value = false
    users.value = []
    typingUsers.value = typingUsers.value.filter(
      (u: UserDTO) => u.id !== socket.id,
    )
  }

  return {
    messages: readonly(messages),
    users: readonly(users),
    isConnected: readonly(isConnected),
    connect,
    sendMessage,
    messageDeleted,
    setTyping,
    typingUsers: readonly(typingUsers),
    disconnect,
  }
}
