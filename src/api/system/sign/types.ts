export interface SignVO {
  /**
   * primarykey id
   */
  id: string | number;

  /**
   * user id
   */
  userId: string | number;

  /**
   * clock-in type (0 means clock-in, 1 means clock-out)
   */
  signType: string;

  /**
   * remark
   */
  remark: string;

}

export interface SignForm extends BaseEntity {
  /**
   * primarykey id
   */
  id?: string | number;

  /**
   * user id
   */
  userId?: string | number;

  /**
   * clock-in type (0 means clock-in, 1 means clock-out)
   */
  signType?: string;

  /**
   * remark
   */
  remark?: string;

}

export interface SignQuery extends PageQuery {

  /**
   * user id
   */
  userId?: string | number;

  /**
   * clock-in type (0 means clock-in, 1 means clock-out)
   */
  signType?: string;

    /**
     * date range parameter
     */
    params?: any;
}



