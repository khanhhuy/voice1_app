import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import User from '@/models/User'
import Team from '@/models/Team'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

const router = express.Router()

// Generate a unique team name based on user email and timestamp
function generateTeamName(email: string): string {
  const username = email.split('@')[0]
  const timestamp = Date.now().toString(36)
  return `${username}-team-${timestamp}`.toLowerCase()
}

// Initialize passport Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user
      let user = await User.findOne({ where: { email: profile.emails![0].value } })
      
      if (!user) {
        // Create new team first
        const teamName = generateTeamName(profile.emails![0].value)
        const team = await Team.create({
          name: teamName,
          label: `${profile.displayName}'s Team`,
        })
        
        // Create new user with team reference
        user = await User.create({
          email: profile.emails![0].value,
          display_name: profile.displayName,
          sso_provider: 'google',
          settings: {},
          team_id: team.id,
        })
      }

      // Update last login
      await user.update({ last_login_at: new Date() })

      return done(null, user)
    } catch (error) {
      return done(error as Error)
    }
  }
))

passport.serializeUser((user, done) => {
  done(null, (user as User).id)
})

passport.deserializeUser((id, done) => {
  User.findByPk(id as string).then(user => done(null, user))
})

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
)

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login' 
  }),
  (req, res) => {
    // Generate JWT token
    // req.user is set by passport
    const token = jwt.sign(
      { user_id: (req.user as User).id, email: (req.user as User).email },
      process.env.JWT_SECRET!,
      { expiresIn: '180d' }
    )

    // Redirect to frontend with token
    res.redirect(`${process.env.WEB_URL}/account?token=${token}`)
  }
)

// Verify token endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { user_id: string }
    const user = await User.findOne({ where: { id: decoded.user_id } })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name,
        profile_settings: user.settings,
      }
    })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export const routes = router 