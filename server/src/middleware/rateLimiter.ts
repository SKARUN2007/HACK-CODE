import rateLimit from 'express-rate-limit';
import { logSecurityEvent } from '../utils/securityLogger';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  handler: (req, res, next, options) => {
    logSecurityEvent({
      type: 'RATE_LIMIT_TRIGGERED',
      severity: 'MEDIUM',
      endpoint: req.originalUrl,
      description: 'Global API rate limit exceeded per IP window.',
    });
    res.status(options.statusCode).send(options.message);
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit auth attempts (login/register) to 20 requests per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again later.',
  },
  handler: (req, res, next, options) => {
    logSecurityEvent({
      type: 'LOGIN_RATE_LIMITED',
      severity: 'HIGH',
      endpoint: req.originalUrl,
      description: 'Brute-force protection triggered: Authentication rate limit exceeded.',
    });
    res.status(options.statusCode).send(options.message);
  },
});
