import { InternalError } from '@src/errors/internalError';

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage = `Unexpected error when trying to comunicace to StormGlass`;
    super(`${internalMessage}:${message}`);
  }

  public static throw(error: any) {
    return new ClientRequestError(error.message);
  }
}
