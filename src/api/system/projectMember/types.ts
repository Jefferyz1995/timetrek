export interface ProjectMemberVO {
  /**
   * 主键id
   */
  id: string | number;

  /**
   * 项目id
   */
  projectId: string | number;

  /**
   * 成员id
   */
  memberUserId: string | number;

  /**
   * 项目组id
   */
  memberGroupId: string | number;

  /**
   * 成员类型(0为成员,1为项目组)
   */
  memberType: string;

  /**
   * 成员角色
   */
  memberRole: string;

  /**
   * 备注
   */
  remark: string;

}

export interface ProjectMemberForm extends BaseEntity {
  /**
   * 主键id
   */
  id?: string | number;

  /**
   * 项目id
   */
  projectId?: string | number;

  /**
   * 成员id
   */
  memberUserId?: string | number;

  /**
   * 项目组id
   */
  memberGroupId?: string | number;

  /**
   * 成员类型(0为成员,1为项目组)
   */
  memberType?: string;

  /**
   * 成员角色
   */
  memberRole?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface ProjectMemberQuery extends PageQuery {

  /**
   * 项目id
   */
  projectId?: string | number;

  /**
   * 成员id
   */
  memberUserId?: string | number;

  /**
   * 项目组id
   */
  memberGroupId?: string | number;

  /**
   * 成员类型(0为成员,1为项目组)
   */
  memberType?: string;

  /**
   * 成员角色
   */
  memberRole?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



