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

export interface CreateDaoDto {
  id: string;
}

export interface Employee {
  id: number;
  name: string;
  nearLogin: string;
  email: string;
  relationDaoToEmployee: RelationDaoToEmployee[];
}

export interface RoketoStream {
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
}

export interface Application {
  id: string;
  status: 'Initialized' | 'Active' | 'Paused' | 'Finished';
  redirectUrl: string;
  payload: string;
  stream: RoketoStream;
  accountId: string;

  /** @format date-time */
  createdAt: string;

  /** @format date-time */
  updatedAt: string;
  planId: string;
  plan: Plan;
}

export interface Plan {
  id: string;
  period: 'Day' | 'Week' | 'Month';
  status: 'Active' | 'Archived';
  amount: number;
  tokenId: string;
  isEditable: boolean;
  isPausable: boolean;
  hasEmails: boolean;

  /** @format date-time */
  updatedAt: string;
  parentPlanId: string;
  plan: Plan;
  subscriptionId: number;
  subscription: Subscription;
  applications: Application[];
}

export interface Subscription {
  id: number;
  title: string;
  description: string;
  webHookLink: string;
  daoId: string;
  dao: Dao;
  plans: Plan[];
}

export interface Dao {
  id: string;
  relationDaoToEmployee: RelationDaoToEmployee[];
  subscriptions: Subscription[];
}

export interface RelationDaoToEmployee {
  id: number;
  type: 'Contractor' | 'Freelancer';
  status: 'Active' | 'Suspended' | 'Fired';
  position: string;
  comment: string;
  salary: number;
  token: string;

  /** @format date-time */
  startDate: string | null;
  payPeriod: number;

  /** @format date-time */
  deadline: string | null;
  workPrice: number;
  isTest: boolean;
  employeeId: number;
  employee: Employee;
  daoId: string;
  dao: Dao;
}

export interface EmployeeResponseDto {
  id: number;
  status: 'Active' | 'Suspended' | 'Fired';
  type: 'Contractor' | 'Freelancer';
  name: string;
  position: string;
  nearLogin: string;
  email: string;
  salary: number;

  /** @format date-time */
  startDate: string;
  payPeriod: number;
  token: string;
  comment?: string;
}

export interface DraftInvoiceResponseDto {
  id: number;
  type: 'EmployeePayroll';
  daoId: string;
  employeeId: number;
  employeeName: string;
  employeeNearLogin: string;
  token: string;
  amount: number;

  /** @format date-time */
  periodStart: string;

  /** @format date-time */
  periodEnd: string;
  status: 'Active' | 'Cancel' | 'Confirmed';
}

export interface UpdateDraftInvoiceDto {
  status: 'Active' | 'Cancel' | 'Confirmed';
}

export interface CreateEmployeeDto {
  name: string;
  nearLogin: string;
  email: string;
  amount: number;
  token: string;
  type: 'Contractor' | 'Freelancer';
  status: 'Active' | 'Suspended' | 'Fired';
  position?: string;
  comment?: string;
  startDate?: string;
  payPeriod?: number;
  deadline?: string;
  isTest?: boolean;
}

export interface UpdateEmployeeDto {
  name: string;
  nearLogin: string;
  email: string;
  amount: number;
  token: string;
  type: 'Contractor' | 'Freelancer';
  status: 'Active' | 'Suspended' | 'Fired';
  position?: string;
  comment?: string;
  startDate?: string;
  payPeriod?: number;
  deadline?: string;
  isTest?: boolean;
}

export interface AuthenticationTokenDto {
  'x-authentication-api': string;
}

export interface PlanResponseDto {
  id: string;
  period: 'Day' | 'Week' | 'Month';
  amount: number;
  tokenId: string;
  isEditable: boolean;
  isPausable: boolean;
  hasEmails: boolean;
  subscriptionId: number;
}

export interface SubscriptionResponseDto {
  id: number;
  daoId: string;
  title?: string;
  description?: string;
  webHookLink?: string;
  plans: PlanResponseDto[];
}

export interface CreateSubscriptionDto {
  title?: string;
  description?: string;
  webHookLink?: string;
  daoId: string;
}

export interface CreatePlanDto {
  id: string;
  period: 'Day' | 'Week' | 'Month';
  amount: number;
  tokenId: string;
  isEditable: boolean;
  isPausable: boolean;
  hasEmails: boolean;
  subscriptionId: number;
}

export interface CreateSubscriptionWithPlanDto {
  title?: string;
  description?: string;
  webHookLink?: string;
  daoId: string;
  plans: CreatePlanDto[];
}

export interface UpdatePlanDto {
  id: string;
  period: 'Day' | 'Week' | 'Month';
  amount: number;
  tokenId: string;
  isEditable: boolean;
  isPausable: boolean;
  hasEmails: boolean;
  subscriptionId: number;
}

export interface ApplicationResponseDto {
  id: string;
  status: 'Initialized' | 'Active' | 'Paused' | 'Finished';
  redirectUrl: string;
  payload: string;
  amount?: number;
  stream: RoketoStream;
  accountId: string;

  /** @format date-time */
  createdAt: string;
  plan: Plan;
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
  public baseUrl: string = '';
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
 * @title No title
 * @version 1.0.0
 * @contact
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  dao = {
    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerCreateDao
     * @request POST:/dao
     * @secure
     * @response `201` `object`
     */
    daoControllerCreateDao: (data: CreateDaoDto, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/dao`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerFindOneDao
     * @request GET:/dao/{daoId}
     * @secure
     * @response `200` `Dao`
     */
    daoControllerFindOneDao: (daoId: string, params: RequestParams = {}) =>
      this.request<Dao, any>({
        path: `/dao/${daoId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerRemoveDao
     * @request DELETE:/dao/{daoId}
     * @secure
     * @response `200` `object`
     */
    daoControllerRemoveDao: (daoId: string, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/dao/${daoId}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerFindAllEmployees
     * @request GET:/dao/{daoId}/employees
     * @secure
     * @response `200` `(EmployeeResponseDto)[]` List of Employee
     */
    daoControllerFindAllEmployees: (
      daoId: string,
      query?: {
        sort?: 'name' | 'id';
        direction?: 'ASC' | 'DESC';
        type?: 'Contractor' | 'Freelancer';
        status?: 'Active' | 'Suspended' | 'Fired';
      },
      params: RequestParams = {},
    ) =>
      this.request<EmployeeResponseDto[], any>({
        path: `/dao/${daoId}/employees`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerCreateEmployee
     * @request POST:/dao/{daoId}/employees
     * @secure
     * @response `201` `object`
     */
    daoControllerCreateEmployee: (
      daoId: string,
      data: CreateEmployeeDto,
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/dao/${daoId}/employees`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerFindAllDaoInvoices
     * @request GET:/dao/{daoId}/invoices
     * @secure
     * @response `200` `(DraftInvoiceResponseDto)[]` List of DAO invoices
     */
    daoControllerFindAllDaoInvoices: (
      daoId: string,
      query: {status: 'Active' | 'Cancel' | 'Confirmed'},
      params: RequestParams = {},
    ) =>
      this.request<DraftInvoiceResponseDto[], any>({
        path: `/dao/${daoId}/invoices`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerUpdateDaoDraftInvoiceStatus
     * @request POST:/dao/{daoId}/invoices/{invoiceId}
     * @secure
     * @response `200` `void` Updated invoices
     * @response `201` `void`
     */
    daoControllerUpdateDaoDraftInvoiceStatus: (
      invoiceId: string,
      daoId: string,
      data: UpdateDraftInvoiceDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/dao/${daoId}/invoices/${invoiceId}`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerRemoveDaoDraftInvoice
     * @request DELETE:/dao/{daoId}/invoices/{invoiceId}
     * @secure
     * @response `200` `void` Remove invoices
     */
    daoControllerRemoveDaoDraftInvoice: (
      daoId: string,
      invoiceId: number,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/dao/${daoId}/invoices/${invoiceId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerUpdateEmployee
     * @request PATCH:/dao/{daoId}/employees/{employeeId}
     * @secure
     * @response `200` `object`
     */
    daoControllerUpdateEmployee: (
      daoId: string,
      employeeId: number,
      data: UpdateEmployeeDto,
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/dao/${daoId}/employees/${employeeId}`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerFindOneEmployeeByDao
     * @request GET:/dao/{daoId}/employees/{employeeId}
     * @secure
     * @response `200` `(EmployeeResponseDto)[]`
     */
    daoControllerFindOneEmployeeByDao: (
      daoId: string,
      employeeId: number,
      params: RequestParams = {},
    ) =>
      this.request<EmployeeResponseDto[], any>({
        path: `/dao/${daoId}/employees/${employeeId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerRemoveEmployee
     * @request DELETE:/dao/{daoId}/employees/{employeeId}
     * @secure
     * @response `200` `void`
     */
    daoControllerRemoveEmployee: (daoId: string, employeeId: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/dao/${daoId}/employees/${employeeId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerChangeEmployeeStatus
     * @request POST:/dao/{daoId}/employees/{employeeId}/{action}
     * @secure
     * @response `201` `object`
     */
    daoControllerChangeEmployeeStatus: (
      daoId: string,
      employeeId: number,
      action: 'Suspend' | 'Reinstate' | 'Fire' | 'Rehire',
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/dao/${daoId}/employees/${employeeId}/${action}`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags DAO
     * @name DaoControllerSuggestAllEmployees
     * @request GET:/dao/{daoId}/employees/suggest
     * @secure
     * @response `200` `(object)[]`
     */
    daoControllerSuggestAllEmployees: (daoId: string, params: RequestParams = {}) =>
      this.request<object[], any>({
        path: `/dao/${daoId}/employees/suggest`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  authentication = {
    /**
     * No description
     *
     * @tags Authentication
     * @name AuthenticationControllerLogIn
     * @request POST:/authentication/login
     * @response `200` `AuthenticationTokenDto` Authentication token
     */
    authenticationControllerLogIn: (params: RequestParams = {}) =>
      this.request<AuthenticationTokenDto, any>({
        path: `/authentication/login`,
        method: 'POST',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authentication
     * @name AuthenticationControllerLogOut
     * @request POST:/authentication/logout
     * @response `201` `void`
     */
    authenticationControllerLogOut: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/authentication/logout`,
        method: 'POST',
        ...params,
      }),
  };
  subscriptions = {
    /**
     * No description
     *
     * @tags Subscriptions
     * @name SubscriptionsControllerFindAllSubscriptions
     * @request GET:/subscriptions/{daoId}/subscriptions
     * @secure
     * @response `200` `void` List of Subscriptions
     */
    subscriptionsControllerFindAllSubscriptions: (
      daoId: string,
      query?: {sort?: 'id'; direction?: 'ASC' | 'DESC'},
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/subscriptions/${daoId}/subscriptions`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Subscriptions
     * @name SubscriptionsControllerFindOneSubscription
     * @request GET:/subscriptions/{subscriptionId}
     * @secure
     * @response `200` `SubscriptionResponseDto` One Subscription
     */
    subscriptionsControllerFindOneSubscription: (
      subscriptionId: number,
      params: RequestParams = {},
    ) =>
      this.request<SubscriptionResponseDto, any>({
        path: `/subscriptions/${subscriptionId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Subscriptions
     * @name SubscriptionsControllerRemoveSubscription
     * @request DELETE:/subscriptions/{subscriptionId}
     * @secure
     * @response `200` `object`
     */
    subscriptionsControllerRemoveSubscription: (
      subscriptionId: number,
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/subscriptions/${subscriptionId}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Subscriptions
     * @name SubscriptionsControllerCreateSubscription
     * @request POST:/subscriptions/{daoId}
     * @secure
     * @response `201` `object`
     */
    subscriptionsControllerCreateSubscription: (
      daoId: string,
      data: CreateSubscriptionDto,
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/subscriptions/${daoId}`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Subscriptions
     * @name SubscriptionsControllerCreateSubscriptionWithPlan
     * @request POST:/subscriptions/{daoId}/plans/{subscriptionId}
     * @secure
     * @response `201` `object`
     */
    subscriptionsControllerCreateSubscriptionWithPlan: (
      daoId: string,
      subscriptionId: number,
      data: CreateSubscriptionWithPlanDto,
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/subscriptions/${daoId}/plans/${subscriptionId}`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Subscriptions
     * @name SubscriptionsControllerUpdatePlan
     * @request PATCH:/subscriptions/{subscriptionId}/plans/{planId}
     * @secure
     * @response `200` `object`
     */
    subscriptionsControllerUpdatePlan: (
      subscriptionId: number,
      planId: string,
      data: UpdatePlanDto,
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/subscriptions/${subscriptionId}/plans/${planId}`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Subscriptions
     * @name SubscriptionsControllerRemovePlan
     * @request DELETE:/subscriptions/{planId}/plans
     * @secure
     * @response `200` `void`
     */
    subscriptionsControllerRemovePlan: (planId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/subscriptions/${planId}/plans`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),
  };
  applications = {
    /**
     * No description
     *
     * @tags Applications
     * @name ApplicationsControllerFindAllApplicationsBySubscription
     * @request GET:/applications/{subscriptionId}
     * @secure
     * @response `200` `(ApplicationResponseDto)[]` List of Applications by subscription
     */
    applicationsControllerFindAllApplicationsBySubscription: (
      subscriptionId: number,
      query?: {sort?: 'id'; direction?: 'ASC' | 'DESC'},
      params: RequestParams = {},
    ) =>
      this.request<ApplicationResponseDto[], any>({
        path: `/applications/${subscriptionId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Applications
     * @name ApplicationsControllerFindAllApplicationsByAccount
     * @request GET:/applications/{accountId}/application
     * @response `200` `(ApplicationResponseDto)[]` List of Applications by subscription
     */
    applicationsControllerFindAllApplicationsByAccount: (
      accountId: string,
      params: RequestParams = {},
    ) =>
      this.request<ApplicationResponseDto[], any>({
        path: `/applications/${accountId}/application`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Applications
     * @name ApplicationsControllerFindAllApplicationsByAccountAndSubscription
     * @request GET:/applications/{subscriptionId}/{acccountId}/application
     * @secure
     * @response `200` `(ApplicationResponseDto)[]` List of Applications by subscription and account
     */
    applicationsControllerFindAllApplicationsByAccountAndSubscription: (
      subscriptionId: string,
      acccountId: string,
      params: RequestParams = {},
    ) =>
      this.request<ApplicationResponseDto[], any>({
        path: `/applications/${subscriptionId}/${acccountId}/application`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
