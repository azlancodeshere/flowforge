export class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message = "Something went wrong") {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
  }
}
