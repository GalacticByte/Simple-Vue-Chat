import type { UserDTO } from '@app/shared'

/**
 * Represents the subset of user fields selected from the database.
 */
type UserSelect = {
  id: string
  nickname: string
}

/**
 * Maps a database User object to a User Data Transfer Object (DTO).
 * This prepares the user data to be sent to the client.
 *
 * @param user The user object selected from the database.
 * @returns The user DTO formatted for client consumption.
 */
export const toUserDTO = (user: UserSelect): UserDTO => ({
  id: user.id,
  nickname: user.nickname,
})
