export interface AskHolidayVO {
  /**
   * 主键id
   */
  id: string | number;

  /**
   * 用户id
   */
  userId: string | number;

  /**
   * 请假天数
   */
  askDays: string;

  /**
   * 请求状态
   */
  askStatus: string;

  /**
   * 请假事由
   */
  askReason: string;

  /**
   * 审批意见
   */
  approvalOpinion: string;

  /**
   * 备注
   */
  remark: string;

}

export interface AskHolidayForm extends BaseEntity {
  /**
   * 主键id
   */
  id?: string | number;

  /**
   * 用户id
   */
  userId?: string | number;

  /**
   * 请假天数
   */
  askDays?: string;

  /**
   * 请求状态
   */
  askStatus?: string;

  /**
   * 请假事由
   */
  askReason?: string;

  /**
   * 审批意见
   */
  approvalOpinion?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface AskHolidayQuery extends PageQuery {

  /**
   * 用户id
   */
  userId?: string | number;

  /**
   * 请假天数
   */
  askDays?: string;

  /**
   * 请求状态
   */
  askStatus?: string;

  /**
   * 请假事由
   */
  askReason?: string;

  /**
   * 审批意见
   */
  approvalOpinion?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



