export interface TreeVO {
  /**
   * Primary Key
   */
  id: string | number;

  /**
   * Parent id
   */
  parentId: string | number;

  /**
   * dept id
   */
  deptId: string | number;

  /**
   * user id
   */
  userId: string | number;

  /**
   * value
   */
  treeName: string;

  /**
   * children
   */
  children: TreeVO[];
}

export interface TreeForm extends BaseEntity {
  /**
   * primary key
   */
  id?: string | number;

  /**
   * parent id
   */
  parentId?: string | number;

  /**
   * dept id
   */
  deptId?: string | number;

  /**
   * userid
   */
  userId?: string | number;

  /**
   * value
   */
  treeName?: string;
}

export interface TreeQuery {
  /**
   * parent id
   */
  parentId?: string | number;

  /**
   * dept id
   */
  deptId?: string | number;

  /**
   * user id
   */
  userId?: string | number;

  /**
   * value
   */
  treeName?: string;
}
