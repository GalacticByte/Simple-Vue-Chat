// New file: server/auth.ts
import { Router } from 'express'
import { prisma } from './lib/prisma.js'
import jwt from 'jsonwebtoken'

const router = Router()

/**
 * Validates a nickname based on length and character constraints.
 * @param nickname The nickname to validate.
 * @returns True if the nickname is valid, false otherwise.
 */
const validateNickname = (nickname: string) => {
  if (
    typeof nickname !== 'string' ||
    nickname.length < 3 ||
    nickname.length > 20
  ) {
    return false
  }
  // Simple character validation (alphanumeric)
  const regex = /^[a-zA-Z0-9]+$/
  return regex.test(nickname)
}

/**
 * Handles user login. Validates the nickname, checks for uniqueness,
 * creates a new user if they don't exist, and returns a JWT.
 */
router.post('/login', async (req, res) => {
  const { nickname } = req.body

  if (!validateNickname(nickname)) {
    return res.status(400).json({
      message:
        'Nieprawidłowy nickname. Musi mieć od 3 do 20 znaków i składać się tylko z liter i cyfr.',
    })
  }

  try {
    // Check if nickname is already taken
    const existingUser = await prisma.user.findUnique({
      where: { nickname },
    })

    if (existingUser) {
      return res.status(409).json({
        message: 'Ten nickname jest już zajęty. Wybierz inny.',
      })
    }

    // Create new user
    const user = await prisma.user.create({
      data: { nickname },
    })

    // Create JWT
    // Remember to move 'super-secret-key' to environment variables!
    const token = jwt.sign(
      { sub: user.id, nickname: user.nickname },
      process.env.JWT_SECRET || 'super-secret-key',
      { expiresIn: '1h' }, // Short-lived token
    )

    res.json({
      userId: user.id,
      nickname: user.nickname,
      token,
    })
  } catch (error) {
    console.error('Błąd podczas logowania:', error)
    res.status(500).json({ message: 'Wystąpił błąd serwera.' })
  }
})

export default router
