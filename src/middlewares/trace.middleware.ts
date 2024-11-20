import { Request, Response, NextFunction } from "express"
import { logger } from "../shared"

export const traceMiddleware = (req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.url}`)
    next()
}