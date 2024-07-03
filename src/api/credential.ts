export type ClientOptions = {
  url: string;
};

export type InquiryStatus = string;

export type InquiryRecord = {
  email?: string;
  name?: string;
  company_name?: string;
  phone_number?: string;
  creation_date?: string;
  update_date?: string;
  status?: InquiryStatus;
  origin?: string;
  reason_for_contact?: string;
  id?: string;
};

export type RequestStoreInquiry = {
  record: InquiryRecord;
};

export type VerifyCredentialRequest = {
  credentialJWT: string;
};

type APIFetchOptions = {
  headers?: string[];
  baseURI?: string;
  method?: string; // overrides the default method
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
    options: APIFetchOptions = {},
  ): Promise<any> {
    let headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (options.headers) {
      options.headers.forEach((header) => {
        const [key, value] = header.split(": ");
        headers[key] = value;
      });
    }

    const baseURI = options.baseURI || this.options.url;
    const method = options.method || "POST"; // default to POST

    const url = baseURI + endpoint;
    const response = await fetch(url, {
      method: method, // dynamic method
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async requestCredential(request: RequestStoreInquiry): Promise<any> {
    return this.fetchHTTPAPI("/inquiry", request, {});
  }

  async verifyCredential(request: VerifyCredentialRequest): Promise<any> {
    console.log("request", request);
    return this.fetchHTTPAPI("/verify", request, {});
  }
}
