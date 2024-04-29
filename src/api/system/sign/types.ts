export interface SignVO {
  /**
   * 主键id
   */
  id: string | number;

  /**
   * 用户id
   */
  userId: string | number;

  /**
   * 签到类型(0为签到,1为签退)
   */
  signType: string;

  /**
   * 备注
   */
  remark: string;

}

export interface SignForm extends BaseEntity {
  /**
   * 主键id
   */
  id?: string | number;

  /**
   * 用户id
   */
  userId?: string | number;

  /**
   * 签到类型(0为签到,1为签退)
   */
  signType?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface SignQuery extends PageQuery {

  /**
   * 用户id
   */
  userId?: string | number;

  /**
   * 签到类型(0为签到,1为签退)
   */
  signType?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



