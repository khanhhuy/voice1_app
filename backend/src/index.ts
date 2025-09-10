import process from 'node:process'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import passport from 'passport'
import { createServer } from 'http'
import { AudioWebSocketService } from './controllers/audioWebSocket'
import { routes as conversationsRoutes } from './controllers/conversationController'
import { routes as authRoutes } from './controllers/authController'
import { routes as userRoutes } from './controllers/userController'
import { authMiddleware, getUserFromToken } from './middleware/authMiddleware'
import { getDb, sync } from './db'

const app = express()

// CORS middleware - must be first
app.use(cors({
  origin: ['http://localhost:3009'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}))

// Other middleware
app.use(express.json({
  limit: '20mb',
  verify: (req, res, buf) => {
    (req as any).rawBody = buf
  }
}))
app.use(express.urlencoded({
  extended: true,
  verify: (req, res, buf) => {
    (req as any).rawBody = buf
  }
}))

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.use(passport.initialize())

app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth/')) {
    return next()
  }
  return authMiddleware(req, res, next)
})

app.use('/api/auth', authRoutes)
app.use('/api/conversations', conversationsRoutes)
app.use('/api/users', userRoutes)

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})


const PORT = 3006

// Create HTTP server
const server = createServer(app)

// Initialize WebSocket service
export const audioWebSocketService = new AudioWebSocketService()

server.on('upgrade', async (request, socket, head) => {
  if (!request.url) {
    socket.destroy()
    return
  }

  const url = new URL(request.url, `http://${request.headers.host}`)
  const { pathname, searchParams } = url
  
  // TODO: should use a different token to reduce the risk of token leakage
  // Extract token from query parameters
  const token = searchParams.get('token')

  const user = await getUserFromToken(token || '')

  if (!user) {
    socket.destroy()
    return
  }

  if (pathname === '/talk') {
    audioWebSocketService.handleUpgrade(request, socket, head, user)
  } else {
    socket.destroy()
  }
})

server.listen(PORT, async () => {
  try {
    console.log(`Server listening on port ${PORT}`)
    console.log(`WebSocket audio service available at ws://localhost:${PORT}/talk`)

    // initialize models
    getDb()

    // await sync()
  } catch (error) {
    console.error('Failed to start server:', error)
  }
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received')
  process.exit(0)
})
