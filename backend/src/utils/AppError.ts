export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates whether the error was expected (e.g., validation) vs unknown bug

    Error.captureStackTrace(this, this.constructor);
  }
}
