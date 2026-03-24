import { Request, Response, NextFunction } from 'express';

type AsyncExpressRoute = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps an async route handler to automatically catch promise rejections 
 * and pass them to the Express error handling middleware via `next(err)`.
 */
export const asyncHandler = (fn: AsyncExpressRoute) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
