/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Unauthorized {
  statusCode: number;
  error: string;
}

export interface HelloResponse {
  data: string;
}

export interface LoginDto {
  /** The accountId of a user. */
  accountId: string;

  /** Current timestamp. */
  timestamp: number;

  /**
   * Signature of timestamp string signed with user's private key in form of an array of 64 integer numbers.
   * @example [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63]
   */
  signature: number[];
}

export interface AccessTokenDto {
  /** JWT to use in bearer authorization */
  accessToken: string;
}

export interface BadRequest {
  statusCode: number;

  /** Array of error messages */
  message: string[];
  error: string;
}

export interface User {
  accountId: string;
  name: string;
  email: string;
  isEmailVerified: boolean;

  /** @format date-time */
  verificationEmailSentAt: string;
  allowNotifications: boolean;
}

export interface UpdateUserDto {
  /** The name of a user. */
  name?: string;

  /** The email of a user. */
  email?: string;

  /** User's permission for email notifications. */
  allowNotifications?: boolean;
}

export interface RoketoStream {
  amount_to_push: string;
  balance: string;
  cliff?: number;
  creator_id: string;
  description: string;
  id: string;
  is_expirable: boolean;
  is_locked: boolean;
  last_action: number;
  owner_id: string;
  receiver_id: string;
  status: 'Initialized' | 'Active' | 'Paused';
  timestamp_created: number;
  token_account_id: string;
  tokens_per_sec: string;
  tokens_total_withdrawn: string;
  wasDue?: boolean;
  hasPassedCliff?: boolean;
}

export interface Notification {
  id: string;
  accountId: string;
  streamId: string;

  /** @format date-time */
  createdAt: string;
  isRead: boolean;
  type:
    | 'StreamStarted'
    | 'StreamPaused'
    | 'StreamFinished'
    | 'StreamIsDue'
    | 'StreamContinued'
    | 'StreamCliffPassed'
    | 'StreamFundsAdded';
  payload: {stream: RoketoStream; fundsAdded?: string};
}

export interface ArchivedStream {
  streamId: string;
  accountId: string;
  receiverId: string;

  /** @format date-time */
  startedAt: string;

  /** @format date-time */
  finishedAt: string;
  payload: {stream: RoketoStream};
}

export interface UserFt {
  accountId: string;
  list: string[];
  blockTimestamp: string;
}

export interface UserNft {
  accountId: string;
  list: string[];
  blockTimestamp: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = 'https://roketo-test-api.herokuapp.com';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(type && type !== ContentType.FormData ? {'Content-Type': type} : {}),
          ...(requestParams.headers || {}),
        },
        signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
        body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data.data;
    });
  };
}

/**
 * @title Roke.to
 * @version 0.0.1
 * @baseUrl https://roketo-test-api.herokuapp.com
 * @contact
 *
 * The best realtime streaming solution
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name GetHello
   * @request GET:/
   * @secure
   * @response `200` `HelloResponse`
   * @response `401` `Unauthorized`
   */
  getHello = (params: RequestParams = {}) =>
    this.request<HelloResponse, Unauthorized>({
      path: `/`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });

  auth = {
    /**
     * No description
     *
     * @tags auth
     * @name Login
     * @request POST:/auth/login
     * @response `201` `AccessTokenDto` Issues JWT for accessing all the other endpoints
     * @response `400` `BadRequest`
     */
    login: (data: LoginDto, params: RequestParams = {}) =>
      this.request<AccessTokenDto, BadRequest>({
        path: `/auth/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags users
     * @name FindOne
     * @request GET:/users/{accountId}
     * @secure
     * @response `200` `User`
     * @response `401` `Unauthorized`
     */
    findOne: (accountId: string, params: RequestParams = {}) =>
      this.request<User, Unauthorized>({
        path: `/users/${accountId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name Update
     * @request PATCH:/users/{accountId}
     * @secure
     * @response `204` `void`
     * @response `401` `Unauthorized`
     */
    update: (accountId: string, data: UpdateUserDto, params: RequestParams = {}) =>
      this.request<void, Unauthorized>({
        path: `/users/${accountId}`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name GetAvatarUrl
     * @request GET:/users/{accountId}/avatar
     * @response `200` `void`
     */
    getAvatarUrl: (accountId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/${accountId}/avatar`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name VerifyEmail
     * @request GET:/users/{accountId}/verifyEmail/{jwt}
     * @response `200` `void`
     */
    verifyEmail: (accountId: string, jwt: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/${accountId}/verifyEmail/${jwt}`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name ResendVerificationEmail
     * @request POST:/users/{accountId}/verifyEmail
     * @secure
     * @response `201` `void`
     * @response `401` `Unauthorized`
     */
    resendVerificationEmail: (accountId: string, params: RequestParams = {}) =>
      this.request<void, Unauthorized>({
        path: `/users/${accountId}/verifyEmail`,
        method: 'POST',
        secure: true,
        ...params,
      }),
  };
  notifications = {
    /**
     * No description
     *
     * @tags notifications
     * @name FindAllNotifications
     * @request GET:/notifications
     * @secure
     * @response `200` `(Notification)[]`
     */
    findAllNotifications: (params: RequestParams = {}) =>
      this.request<Notification[], any>({
        path: `/notifications`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags notifications
     * @name MarkAllRead
     * @request POST:/notifications/readAll
     * @secure
     * @response `204` `void`
     */
    markAllRead: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/notifications/readAll`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags notifications
     * @name Unsubscribe
     * @request GET:/notifications/{accountId}/unsubscribe/{jwt}
     * @secure
     * @response `200` `void`
     */
    unsubscribe: (accountId: string, jwt: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/notifications/${accountId}/unsubscribe/${jwt}`,
        method: 'GET',
        secure: true,
        ...params,
      }),
  };
  archivedStreams = {
    /**
     * No description
     *
     * @tags archived_streams
     * @name FindArchivedStreams
     * @request GET:/archived_streams
     * @secure
     * @response `200` `(ArchivedStream)[]`
     */
    findArchivedStreams: (params: RequestParams = {}) =>
      this.request<ArchivedStream[], any>({
        path: `/archived_streams`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  tokens = {
    /**
     * No description
     *
     * @tags tokens
     * @name FindAllTokens
     * @request GET:/tokens/fts/{accountId}
     * @secure
     * @response `200` `(UserFt)[]`
     */
    findAllTokens: (accountId: string, params: RequestParams = {}) =>
      this.request<UserFt[], any>({
        path: `/tokens/fts/${accountId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags tokens
     * @name FindAllNfTs
     * @request GET:/tokens/nfts/{accountId}
     * @secure
     * @response `200` `(UserNft)[]`
     */
    findAllNfTs: (accountId: string, params: RequestParams = {}) =>
      this.request<UserNft[], any>({
        path: `/tokens/nfts/${accountId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
