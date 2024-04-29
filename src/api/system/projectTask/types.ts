export interface ProjectTaskVO {
  /**
   * 主键id
   */
  id: string | number;

  /**
   * 项目id
   */
  projectId: string | number;

  /**
   * 任务名
   */
  taskName: string;

  /**
   * 任务描述
   */
  taskDescription: string;

  /**
   * 任务负责人
   */
  taskUserId: string | number;

  /**
   * 任务状态(0未开始,1进行中,2已结束)
   */
  taskStatus: string;

  /**
   * 任务重要程度(0:不重要1重要,2:非常重要)
   */
  taskImportant: string;

  /**
   * 任务开始时间
   */
  taskStartTime: string;

  /**
   * 任务截止时间
   */
  taskEndTime: string;

  /**
   * 备注
   */
  remark: string;

}

export interface ProjectTaskForm extends BaseEntity {
  /**
   * 主键id
   */
  id?: string | number;

  /**
   * 项目id
   */
  projectId?: string | number;

  /**
   * 任务名
   */
  taskName?: string;

  /**
   * 任务描述
   */
  taskDescription?: string;

  /**
   * 任务负责人
   */
  taskUserId?: string | number;

  /**
   * 任务状态(0未开始,1进行中,2已结束)
   */
  taskStatus?: string;

  /**
   * 任务重要程度(0:不重要1重要,2:非常重要)
   */
  taskImportant?: string;

  /**
   * 任务开始时间
   */
  taskStartTime?: string;

  /**
   * 任务截止时间
   */
  taskEndTime?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface ProjectTaskQuery extends PageQuery {

  /**
   * 项目id
   */
  projectId?: string | number;

  /**
   * 任务名
   */
  taskName?: string;

  /**
   * 任务描述
   */
  taskDescription?: string;

  /**
   * 任务负责人
   */
  taskUserId?: string | number;

  /**
   * 任务状态(0未开始,1进行中,2已结束)
   */
  taskStatus?: string;

  /**
   * 任务重要程度(0:不重要1重要,2:非常重要)
   */
  taskImportant?: string;

  /**
   * 任务开始时间
   */
  taskStartTime?: string;

  /**
   * 任务截止时间
   */
  taskEndTime?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



