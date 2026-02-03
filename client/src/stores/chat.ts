import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io, Socket } from 'socket.io-client'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  MessageDTO,
  UserDTO,
} from '@app/shared'

export const useChatStore = defineStore('chat', () => {
  // --- State ---
  const messages = ref<MessageDTO[]>([])
  const users = ref<UserDTO[]>([])
  const isConnected = ref(false)
  const typingUsers = ref<UserDTO[]>([])

  // Socket instance
  const url =
    import.meta.env.VITE_SERVER_URL ||
    (import.meta.env.PROD ? undefined : 'http://localhost:3000')

  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    url as string,
    {
      transports: ['websocket'],
      autoConnect: false,
    },
  )

  // --- Actions ---
  const connect = (token: string) => {
    if (socket.connected) return
    socket.auth = { token }
    socket.connect()
  }

  const disconnect = () => {
    socket.disconnect()
    messages.value = []
    users.value = []
    isConnected.value = false
    typingUsers.value = []
  }

  const sendMessage = (message: string) => {
    socket.emit('newMessage', { message })
  }

  const deleteMessage = (messageId: string) => {
    socket.emit('deleteMessage', { messageId })
  }

  const setTyping = (isTyping: boolean) => {
    socket.emit('isTyping', { isTyping })
  }

  // --- Listeners ---

  socket.on('connect', () => {
    isConnected.value = true
  })

  socket.on('disconnect', () => {
    isConnected.value = false
  })

  socket.on('initChat', (data) => {
    messages.value = data.messages
    users.value = data.users
    typingUsers.value = []
  })

  socket.on('newMessage', (data) => {
    messages.value.push(data)
  })

  socket.on('messageDeleted', ({ messageId }) => {
    messages.value = messages.value.filter((m) => m.id !== messageId)
  })

  socket.on('userConnected', (data) => {
    if (!users.value.some((u) => u.id === data.id)) {
      users.value.push(data)
    }
  })

  socket.on('userDisconnected', (data) => {
    users.value = users.value.filter((u) => u.id !== data.id)
    typingUsers.value = typingUsers.value.filter((u) => u.id !== data.id)
  })

  socket.on('isTyping', ({ userId, isTyping }) => {
    const user = users.value.find((u) => u.id === userId)
    if (!user) return

    if (isTyping) {
      if (!typingUsers.value.some((u) => u.id === userId)) {
        typingUsers.value.push(user)
      }
    } else {
      typingUsers.value = typingUsers.value.filter((u) => u.id !== userId)
    }
  })

  return {
    messages,
    users,
    isConnected,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    deleteMessage,
    setTyping,
  }
})
