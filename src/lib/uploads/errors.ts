/** Upload failure with a message that is safe to return to the client. */
export class UploadError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = "UploadError";
  }
}
