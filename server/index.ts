import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'
import morgan from 'morgan'
import jwt from 'jsonwebtoken'

import authRouter from './auth.js'
import { handleChatConnection } from './socket/chat.handler.js'
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
    console.error('Token verification failed:', err)
    return next(new Error('Authentication error: Invalid token'))
  }
})

io.on('connection', (socket) => {
  handleChatConnection(io, socket)
})

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
