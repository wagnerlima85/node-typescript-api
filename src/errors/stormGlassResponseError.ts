import { InternalError } from '@src/errors/internalError';

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage = `Unexpected error returned by the StormGlass service`;
    super(`${internalMessage}: ${message}`);
  }

  public static throw(e: any) {
    return new StormGlassResponseError(
      `Error: ${JSON.stringify(e.response.data)} Code: ${e.response.status}`
    );
  }
}
