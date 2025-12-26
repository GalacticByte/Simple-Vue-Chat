import type { Message, User } from '@prisma/client'

/**
 * Represents a message with the associated user's nickname.
 * This type extends the base Message type from Prisma and includes
 * a subset of the User type (only the nickname).
 */
export type MessageWithUser = Message & {
  user: Pick<User, 'nickname'> | null
}
