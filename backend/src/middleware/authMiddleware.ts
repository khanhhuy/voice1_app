import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import ModelUser from '@/models/User'
import { requestContext } from '@/services/requestContext'
import User from '@/models/User'

interface JWTPayload {
  user_id: string
  email: string
  iat?: number
  exp?: number
}

async function getUserFromToken(token: string): Promise<User | null> {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  if (!decoded.user_id) {
    throw new Error('Invalid token payload')
  }

  const user = await ModelUser.findOne({
    where: {
      id: decoded.user_id,
    }
  })

  return user
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip auth for certain routes
    if (req.path === '/ping') {
      return next()
    }

    const authHeader = req.headers.authorization
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      throw new Error('No token provided')
    }

    const user = await getUserFromToken(token)

    if (!user) {
      throw new Error('User not found')
    }

    requestContext.run({ user }, () => {
      next()
    })

  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: err instanceof Error ? err.message : 'Authentication failed'
    })
  }
}

export { authMiddleware, getUserFromToken } 