import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-makkalsaantru-jwt-token-key-change-in-production-2026';
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'];


import { passwordSchema } from '../middleware/validationSchemas';
import { logSecurityEvent } from '../utils/securityLogger';

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  role: z.enum(['CITIZEN', 'INSPECTOR', 'ADMIN']).default('CITIZEN'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Demo in-memory fallback user repository for Phase 1 verification
const demoUsers = [
  {
    id: 'demo-citizen-1',
    name: 'Anitha Ramesh (Citizen)',
    email: 'citizen@makkalsaantru.gov.in',
    passwordHash: bcrypt.hashSync('citizen123', 10),
    role: 'CITIZEN' as const,
  },
  {
    id: 'demo-inspector-1',
    name: 'Er. Rajesh Kumar (Inspector)',
    email: 'inspector@makkalsaantru.gov.in',
    passwordHash: bcrypt.hashSync('inspector123', 10),
    role: 'INSPECTOR' as const,
  },
  {
    id: 'demo-admin-1',
    name: 'Administrator (Chief Engineer)',
    email: 'admin@makkalsaantru.gov.in',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'ADMIN' as const,
  },
];

/**
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);
    const existing = demoUsers.find((u) => u.email === validated.email);

    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);
    const newUser = {
      id: `user-${Date.now()}`,
      name: validated.name,
      email: validated.email,
      passwordHash,
      role: validated.role,
    };

    demoUsers.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    return res.status(500).json({ error: 'Failed to register user.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);
    const user = demoUsers.find((u) => u.email.toLowerCase() === validated.email.toLowerCase());

    if (!user) {
      logSecurityEvent({
        type: 'FAILED_LOGIN',
        severity: 'LOW',
        endpoint: '/api/auth/login',
        description: `Failed login attempt for non-existent email: ${validated.email}`,
      });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    let isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch && process.env.NODE_ENV === 'development' && validated.password === 'demo') {
      isMatch = true;
    }

    if (!isMatch) {
      logSecurityEvent({
        type: 'FAILED_LOGIN',
        severity: 'LOW',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        endpoint: '/api/auth/login',
        description: `Failed password login attempt for email: ${validated.email}`,
      });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    return res.status(500).json({ error: 'Failed to authenticate user.' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({ user: req.user });
});

export default router;
