import { Request, Response } from 'express'

export const healthController = {
  ping: (_req: Request, res: Response) => {
    res.json({ success: true, message: 'pong', timestamp: new Date().toISOString() })
  },
}
