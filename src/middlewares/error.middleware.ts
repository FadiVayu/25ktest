import { Response, Request, NextFunction } from 'express'
import { ValidateError } from 'tsoa'
import { APIError } from '../models'
import { logger } from '../shared/Logger'

export class ErrorHandler {
    private _isValidationError(error: any): error is ValidateError {
        return (
            error instanceof ValidateError ||
            (error.message === '' &&
                error.name === 'ValidateError' &&
                error.fields)
        )
    }

    private _isAPIError = (error: any): error is APIError => {
        return error instanceof APIError || (error.name === 'APIError' && error.statusCode)
    }

    private _isError(error: any): error is Error {
        return (error as Error).message !== undefined
    }

    protected _logErrors(
        req: Request,
        message: string = 'Unknown Error Occurred',
        metadata?: { [key: string]: any }
    ) {
        logger.error(`Error Occurred - ${message}`, {
            body: req.body,
            params: req.params,
            ...metadata
        })
    }

    public handle(
        err: unknown,
        req: Request,
        res: Response,
        next: NextFunction
    ): Response | void {
        if (this._isValidationError(err)) {
            this._logErrors(req, err.message, {
                ValidationError: true,
                details: err?.fields
            })
            return res.status(err.status).json({
                message: err.message,
                details: err?.fields
            })
        }

        if (this._isAPIError(err)) {
            this._logErrors(req, err.message, {
                APIError: true,
                details: err.metadata
            })
            return res.status(err.statusCode).json({
                message: err.message,
                details: err.metadata
            })
        }

        if (this._isError(err)) {
            const message = err.message ?? 'Unknown Error Occurred'
            this._logErrors(req, message)
            return res.status(500 as number).json({
                message
            })
        }

        if (err) {
            this._logErrors(req, `Error Occurred - Unexpected Error`)
            return res.status(500).json({
                message: 'Unexpected Error Occurred'
            })
        }

        next()
    }
}

export const errorHandler = new ErrorHandler()

export const errorMiddleware = errorHandler.handle.bind(errorHandler)