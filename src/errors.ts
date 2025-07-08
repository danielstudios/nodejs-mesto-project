export interface IExtendedError {
  statusCode: number;
  message: string;
}

export class ServerError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
