import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import cors from 'cors'
import morgan from 'morgan'
import jwt from 'jsonwebtoken'

import { prisma } from './lib/prisma.js'
import authRouter from './auth.js'
import { toMessageDTO } from './mappers/message.mapper.js'
import { toUserDTO } from './mappers/users.mappers.js'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from '@app/shared'

interface JwtPayload {
  sub: string
  nickname: string
}

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.0.52:5173', // Your IP
  `${process.env.CLIENT_URL}`,
].filter(Boolean)

const corsOptions = {
  origin: allowedOrigins,
  credentials: false, // JWT, not cookies
}

const app = express()
const server = createServer(app)
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>(server, {
  cors: corsOptions,
})

app.use(cors(corsOptions))
app.use(express.json())
app.use(morgan('dev'))

// Calculate __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use('/auth', authRouter)

io.use((socket, next) => {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error('Authentication error: Token not provided'))
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super-secret-key',
    ) as JwtPayload
    socket.data.userId = payload.sub
    socket.data.nickname = payload.nickname
    next()
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'))
  }
})

io.on(
  'connection',
  async (
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

      if (!message) return
      if (message.userId !== userId) return

      await prisma.message.delete({
        where: { id: messageId },
      })

      io.emit('messageDeleted', { messageId })
    })

    // Handle user disconnection
    socket.on('disconnect', async () => {
      const { userId, nickname } = socket.data
      if (!userId) {
        console.log(`Anonymous user disconnected: ${socket.id}`)
        return
      }

      const userDTO = toUserDTO({
        id: socket.data.userId,
        nickname: socket.data.nickname,
      })
      io.emit('userDisconnected', userDTO)

      console.log(`User disconnected: ${nickname} (${socket.id})`)

      try {
        // Also remove the user from the database on disconnect
        await prisma.user.delete({
          where: { id: userId },
        })
        console.log(`User ${nickname} (ID: ${userId}) has been deleted.`)
      } catch (error) {
        console.error(`Failed to delete user ${nickname}:`, error)
      }
    })

    // Handle 'is typing' notifications
    socket.on('isTyping', ({ isTyping }) => {
      const { userId } = socket.data
      if (!userId) return

      socket.broadcast.emit('isTyping', {
        userId,
        isTyping,
      })
    })

    // Receive new message, save it and broadcast to everyone
    socket.on('newMessage', async (data) => {
      // Use data from authenticated socket, not from client
      const { userId, nickname } = socket.data
      if (!userId || !nickname) return // Additional security check

      try {
        const newMessage = await prisma.message.create({
          data: {
            message: data.message,
            userId: userId,
            authorId: userId,
            authorNickname: nickname,
          },
          include: { user: { select: { nickname: true } } },
        })
        io.emit('newMessage', toMessageDTO(newMessage))
      } catch (error) {
        console.error('Failed to save message:', error)
      }
    })
  },
)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')))
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  })
}

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
