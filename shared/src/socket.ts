import type { MessageDTO, UserDTO } from './models.js'

export interface ServerToClientEvents {
  initChat: (payload: { messages: MessageDTO[]; users: UserDTO[] }) => void
  newMessage: (message: MessageDTO) => void
  userConnected: (userId: UserDTO) => void
  userDisconnected: (userId: UserDTO) => void
  isTyping: (payload: { userId: string; isTyping: boolean }) => void
  messageDeleted: (payload: { messageId: string }) => void
}

export interface ClientToServerEvents {
  newMessage: (payload: { message: string }) => void
  isTyping: (payload: { isTyping: boolean }) => void
  deleteMessage: (payload: { messageId: string }) => void
}

export interface SocketData {
  userId: string
  nickname: string
}
