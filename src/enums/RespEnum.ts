export enum HttpStatus {
  /**
   * Successful operation
   */
  SUCCESS = 200,
  /**
   * Object created successfully
   */
  CREATED = 201,
  /**
   * Request has been accepted
   */
  ACCEPTED = 202,
  /**
   * The operation was executed successfully, but no data was returned
   */
  NO_CONTENT = 204,
  /**
   * The resource has been removed
   */
  MOVED_PERM = 301,
  /**
   * Redirect
   */
  SEE_OTHER = 303,
  /**
   * The resource has not been modified
   */
  NOT_MODIFIED = 304,
  /**
   * Wrong parameter list (missing, format mismatch)
   */
  PARAM_ERROR = 400,
  /**
   * unauthorized
   */
  UNAUTHORIZED = 401,
  /**
   * Access restricted, authorization expired
   */
  FORBIDDEN = 403,
  /**
   * Resource, service not found
   */
  NOT_FOUND = 404,
  /**
   * Disallowed http method
   */
  BAD_METHOD = 405,
  /**
   * Resource conflict, or resource is locked
   */
  CONFLICT = 409,
  /**
   * Unsupported data, media type
   */
  UNSUPPORTED_TYPE = 415,
  /**
   * Internal System Error
   */
  SERVER_ERROR = 500,
  /**
   * interface not implemented
   */
  NOT_IMPLEMENTED = 501,
  /**
   * Service is unavailable, overloaded or under maintenance
   */
  BAD_GATEWAY = 502,
  /**
   * Gateway timeout
   */
  GATEWAY_TIMEOUT = 504,
  /**
   * unknown mistake
   */
  UNKNOWN_ERROR = 520,
  /**
   * Unknown service error
   */
  SERVICE_ERROR = 521,
  /**
   * Database unknown error
   */
  DATABASE_ERROR = 522,
  /**
   * System warning message
   */
  WARN = 601
}
