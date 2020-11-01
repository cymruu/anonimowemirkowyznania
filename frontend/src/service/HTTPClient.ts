/* eslint-disable class-methods-use-this */

import { noOpFn } from '../utils';

interface IApiError {
  message: string
}
export class ApiError extends Error {
  constructor(errorObject: IApiError, status: number) {
    super(`[${status}] ${errorObject.message}` || 'Unknow error');
  }
}

type APIErrorInterceptorFn = (err: ApiError) => ApiError
export class HTTPClient {
  private errInterceptors: APIErrorInterceptorFn[]

  constructor(errInterceptors: APIErrorInterceptorFn[] = []) {
    this.errInterceptors = errInterceptors;
  }

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
    })
      .catch((err) => {
        throw this.errInterceptors
          .reduce((errorObject, currentInterceptor) => currentInterceptor(errorObject), err);
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

  delete(endpoint: string) {
    return this.request(endpoint, 'delete');
  }

  swallow(promise: Promise<any>) {
    return new Promise<any>((resolve) => promise.then(resolve).catch(noOpFn));
  }
}
