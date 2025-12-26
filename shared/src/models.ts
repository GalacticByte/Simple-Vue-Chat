export interface MessageAuthorSnapshot {
  id: string
  nickname: string
}

export interface UserDTO {
  id: string
  nickname: string
}

export interface MessageDTO {
  id: string
  message: string
  createdAt: string
  author: MessageAuthorSnapshot
}
