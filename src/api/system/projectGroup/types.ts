export interface ProjectGroupVO {
  /**
   * 主键id
   */
  id: string | number;

  /**
   * 项目组名
   */
  groupName: string;

  /**
   * 备注
   */
  remark: string;

}

export interface ProjectGroupForm extends BaseEntity {
  /**
   * 主键id
   */
  id?: string | number;

  /**
   * 项目组名
   */
  groupName?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface ProjectGroupQuery extends PageQuery {

  /**
   * 项目组名
   */
  groupName?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



