export interface AskHolidayVO {
  /**
   * Primay Key
   */
  id: string | number;

  /**
   * User ID
   */
  userId: string | number;

  /**
   * days of leave
   */
  askDays: string;

  /**
   * Request status
   */
  askStatus: string;

  /**
   * Reason for leave
   */
  askReason: string;

  /**
   * Approval comments
   */
  approvalOpinion: string;

  /**
   * Remark
   */
  remark: string;

}

export interface AskHolidayForm extends BaseEntity {
  /**
   * Primay Key
   */
  id?: string | number;

  /**
   * User ID
   */
  userId?: string | number;

  /**
   * days of leave
   */
  askDays?: string;

  /**
   * Request status
   */
  askStatus?: string;

  /**
   * Reason for leave
   */
  askReason?: string;

  /**
   * Approval comments
   */
  approvalOpinion?: string;

  /**
   * Remark
   */
  remark?: string;

}

export interface AskHolidayQuery extends PageQuery {

  /**
   * User ID
   */
  userId?: string | number;

  /**
   * days of leave
   */
  askDays?: string;

  /**
   * Request status
   */
  askStatus?: string;

  /**
   * Reason for leave
   */
  askReason?: string;

  /**
   * Approval comments
   */
  approvalOpinion?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



