import type { Message } from '@prisma/client'
import type { MessageDTO } from '@app/shared'

/**
 * Maps a database Message object to a Message Data Transfer Object (DTO).
 * This prepares the message data to be sent to the client.
 *
 * @param message The raw message object from the database (Prisma).
 * @returns The message DTO formatted for client consumption.
 */
export const toMessageDTO = (message: Message): MessageDTO => ({
  id: message.id,
  message: message.message,
  createdAt: message.createdAt.toISOString(),
  author: {
    id: message.authorId,
    nickname: message.authorNickname,
  },
})
