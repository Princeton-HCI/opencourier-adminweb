import { ApiException, ApiExceptionCodeEnum } from "./models";

export const ErrorCode = ApiExceptionCodeEnum
export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

export class ApiError extends Error implements ApiException {
  readonly code: ErrorCode;
  readonly message: string;
  readonly statusCode: number;

  constructor(code: ErrorCode, message: string, statusCode: number) {
    super(message)
    this.code = code
    this.message = message
    this.statusCode = statusCode
  }
}
