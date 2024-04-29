export interface OfferVO {
  /**
   *  主键id
   */
  id: string | number;

  /**
   * 招聘岗位
   */
  offerName: string;

  /**
   * 招聘标题
   */
  offerTitle: string;

  /**
   * 招聘介绍
   */
  offerIntroduction: string;

  /**
   * 招聘人数
   */
  offerNum: number;

}

export interface OfferForm extends BaseEntity {
  /**
   *  主键id
   */
  id?: string | number;

  /**
   * 招聘岗位
   */
  offerName?: string;

  /**
   * 招聘标题
   */
  offerTitle?: string;

  /**
   * 招聘介绍
   */
  offerIntroduction?: string;

  /**
   * 招聘人数
   */
  offerNum?: number;

}

export interface OfferQuery extends PageQuery {

  /**
   * 招聘岗位
   */
  offerName?: string;

  /**
   * 招聘标题
   */
  offerTitle?: string;

  /**
   * 招聘介绍
   */
  offerIntroduction?: string;

  /**
   * 招聘人数
   */
  offerNum?: number;

    /**
     * 日期范围参数
     */
    params?: any;
}



