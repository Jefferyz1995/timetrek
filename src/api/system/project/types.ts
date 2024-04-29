export interface ProjectVO {
  /**
   * 主键id
   */
  id: string | number;

  /**
   * 项目名
   */
  projectName: string;

  /**
   * 项目描述
   */
  projectDescription: string;

  /**
   * 项目目标
   */
  projectTarget: string;

  /**
   * 备注
   */
  remark: string;

}

export interface ProjectForm extends BaseEntity {
  /**
   * 主键id
   */
  id?: string | number;

  /**
   * 项目名
   */
  projectName?: string;

  /**
   * 项目描述
   */
  projectDescription?: string;

  /**
   * 项目目标
   */
  projectTarget?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface ProjectQuery extends PageQuery {

  /**
   * 项目名
   */
  projectName?: string;

  /**
   * 项目描述
   */
  projectDescription?: string;

  /**
   * 项目目标
   */
  projectTarget?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



