// Independent JWT-based authentication system
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import type { Express, RequestHandler } from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { z } from 'zod';

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    token?: string;
  }
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;

// Session configuration
let sessionMiddleware: any = null;

export function getSession() {
  if (sessionMiddleware) return sessionMiddleware;
  
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  sessionMiddleware = session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
  
  return sessionMiddleware;
}

// Generate JWT token
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Register endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        firstName,
        lastName,
        hashedPassword,
      });
      
      // Generate token
      const token = generateToken(user.id);
      
      // Set session
      req.session.userId = user.id;
      req.session.token = token;
      
      res.json({
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Verify password
      const isValidPassword = await verifyPassword(password, user.hashedPassword!);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Generate token
      const token = generateToken(user.id);
      
      // Set session
      req.session.userId = user.id;
      req.session.token = token;
      
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  });

  // Get current user endpoint
  app.get('/api/auth/user', async (req, res) => {
    try {
      const token = req.session.token || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Verify token endpoint (for Socket.IO)
  app.post('/api/auth/verify', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: 'No token provided' });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      res.json({
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ message: 'Token verification failed' });
    }
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const token = req.session.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

// Socket.IO authentication helper
export async function authenticateSocket(token: string) {
  try {
    if (!token) {
      throw new Error('No token provided');
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new Error('Invalid token');
    }
    
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    };
  } catch (error) {
    throw new Error('Authentication failed');
  }
}
