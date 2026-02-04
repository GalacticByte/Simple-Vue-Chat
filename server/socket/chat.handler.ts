import type { Server, Socket } from 'socket.io'
import { prisma } from '../lib/prisma.js'
import { toMessageDTO } from '../mappers/message.mapper.js'
import { toUserDTO } from '../mappers/users.mappers.js'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from '@app/shared'

export const handleChatConnection = async (
  io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
) => {
  console.log(`User connected: ${socket.data.nickname} (${socket.id})`)

  // Send chat history to the newly connected user
  try {
    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        // Include user data with each message
        user: { select: { nickname: true } },
      },
    })
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
      },
    })

    socket.emit('initChat', {
      messages: messages.map(toMessageDTO),
      users: users.map(toUserDTO),
    })
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  }

  const userDTO = toUserDTO({
    id: socket.data.userId,
    nickname: socket.data.nickname,
  })

  // Notify all clients that a new user has connected
  io.emit('userConnected', userDTO)

  // Handle message deletion
  socket.on('deleteMessage', async ({ messageId }) => {
    const userId = socket.data.userId
    if (!userId) return

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    })

    if (message?.userId !== userId) return

    await prisma.message.delete({
      where: { id: messageId },
    })

    io.emit('messageDeleted', { messageId })
  })

  // Handle user disconnection
  socket.on('disconnect', async () => {
    const { userId, nickname } = socket.data
    if (!userId || !nickname) {
      console.log(`Anonymous user disconnected: ${socket.id}`)
      return
    }

    io.emit('userDisconnected', toUserDTO({ id: userId, nickname }))
    console.log(`User disconnected: ${nickname} (${socket.id})`)

    try {
      await prisma.user.delete({ where: { id: userId } })
      console.log(`User ${nickname} (ID: ${userId}) has been deleted.`)
    } catch (error) {
      console.error(`Failed to delete user ${nickname}:`, error)
    }
  })

  // Handle 'is typing' notifications
  socket.on('isTyping', ({ isTyping }) => {
    const { userId, nickname } = socket.data
    if (!userId || !nickname) return
    socket.broadcast.emit('isTyping', { userId, isTyping })
  })

  // Receive new message, save it and broadcast to everyone
  socket.on('newMessage', async (data) => {
    const { userId, nickname } = socket.data
    if (!userId || !nickname) return

    const newMessage = await prisma.message.create({
      data: {
        message: data.message,
        userId,
        authorId: userId,
        authorNickname: nickname,
      },
      include: { user: { select: { nickname: true } } },
    })
    io.emit('newMessage', toMessageDTO(newMessage))
  })
}
