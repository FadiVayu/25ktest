export class APIError extends Error {
    public statusCode: number;
    public metadata: any;

    constructor(message: string, statusCode: number, metadata?: any) {
        super(message)
        this.statusCode = statusCode;
        this.metadata = metadata;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, APIError);
        }

        this.name = this.constructor.name;
    }
}