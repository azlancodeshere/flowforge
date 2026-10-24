export class ApiResponse<T = unknown> {
  success: boolean

  constructor(
    public statusCode: number,
    public data: T,
    public message = "Success"
  ) {
    this.success = statusCode < 400
  }
}
