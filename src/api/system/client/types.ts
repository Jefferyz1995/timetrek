export interface ClientVO {
  /**
   * id
   */
  id: string | number;

  /**
   * client id
   */
  clientId: string | number;

  /**
   * client key
   */
  clientKey: string;


  clientSecret: string;

  /**
   * Grant type
   */
  grantTypeList: string[];

  /**
   * device type
   */
  deviceType: string;

  /**
   * token active timeout
   */
  activeTimeout: number;

  /**
   * token fixed timeout
   */
  timeout: number;

  /**
   * Status (0 normal 1 disabled)
   */
  status: string;
}

export interface ClientForm extends BaseEntity {
  /**
   * id
   */
  id?: string | number;

  /**
   * client id
   */
  clientId?: string | number;

  /**
   * client key
   */
  clientKey?: string;


  clientSecret?: string;

  /**
   *  Grant type
   */
  grantTypeList?: string[];

  /**
   * device type
   */
  deviceType?: string;

  /**
   * token active timeout
   */
  activeTimeout?: number;

  /**
   * token fixed timeout
   */
  timeout?: number;

  /**
   * Status (0 normal 1 disabled)
   */
  status?: string;
}

export interface ClientQuery extends PageQuery {
  /**
   * client id
   */
  clientId?: string | number;

  /**
   * client key
   */
  clientKey?: string;


  clientSecret?: string;

  /**
   *  Grant type
   */
  grantType?: string;

  /**
   * device type
   */
  deviceType?: string;

  /**
   * token active timeout
   */
  activeTimeout?: number;

  /**
   * token fixed timeout
   */
  timeout?: number;

  /**
   * Status (0 normal 1 disabled)
   */
  status?: string;
}
