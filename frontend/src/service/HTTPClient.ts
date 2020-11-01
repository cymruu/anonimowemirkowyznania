/* eslint-disable class-methods-use-this */

interface IApiError {
  message: string
}
export class ApiError extends Error {
  constructor(errorObject: IApiError, status: number) {
    super(`[${status}] ${errorObject.message}` || 'Unknow error');
  }
}

export class HTTPClient {
  private request(endpoint: string, method: string, body?: object) {
    return fetch(`/api2/${endpoint}`, {
      method,
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }).then(async (res) => {
      let responseData;
      try {
        responseData = await res.json();
      } catch {
        throw new ApiError({ message: 'API malformed response' }, res.status);
      }
      if (responseData.error) {
        throw new ApiError(responseData.error, res.status);
      }
      return responseData.data;
    });
  }

  get(endpoint: string) {
    return this.request(endpoint, 'GET');
  }

  post(endpoint: string, body: object) {
    return this.request(endpoint, 'post', body);
  }

  put(endpoint: string, body: object) {
    return this.request(endpoint, 'put', body);
  }

  delete(endpoint:string) {
    return this.request(endpoint, 'delete');
  }
}
