import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'

// Central error handler
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // If it's our custom AppError, use its status and message
  if (err instanceof AppError) {
    if (!err.isOperational) {
      console.error('[ERROR] Unexpected bug:', err)
    }
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    })
  }

  // Otherwise, it's an unhandled runtime error (e.g. TypeError, DB error)
  console.error('[ERROR] Unhandled Error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  })
}
