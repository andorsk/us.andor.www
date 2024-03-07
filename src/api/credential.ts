export type ClientOptions = {
  url: string;
};

export type RequestCredentialRequest = {
  issuer: string;
  issuerKID: string;
  subject: string;
  data: string;
};

export type VerifyCredentialRequest = {
  credentailJWT: string;
};

type APIFetchOptions = {
  Headers: string[];
  BaseURI: string; // overrides uri
};
/*
 * Creates a client to use with the website
 */
export class Client {
  private options: ClientOptions;

  constructor(options: ClientOptions) {
    this.options = options;
  }

  async fetchHTTPAPI(
    endpoint: string,
    data: any,
    options: APIFetchOptions,
  ): Promise<any> {
    let headers = ["Accept: application/json", "Content-Type:application/json"];

    if (options.Headers !== null) {
      headers = options.Headers;
    }

    let baseURI = this.options.url;
    if (options.BaseURI === "") {
      baseURI = this.options.url;
    }

    const url = baseURI + endpoint;
    return fetch(url, {
      method: "PUT", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  async requestCredential(request: RequestCredentialRequest): Promise<any> {
    return this.fetchHTTPAPI("/v1/credentials", request, {} as APIFetchOptions);
  }

  async verifyCredential(request: VerifyCredentialRequest): Promise<any> {
    return this.fetchHTTPAPI(
      "/v1/credentials/verification",
      request,
      {} as APIFetchOptions,
    );
  }
}
