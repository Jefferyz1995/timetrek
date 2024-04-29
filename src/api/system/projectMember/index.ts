import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectMemberVO, ProjectMemberForm, ProjectMemberQuery } from '@/api/system/projectMember/types';

/**
 * 查询项目组内成员列表
 * @param query
 * @returns {*}
 */

export const listProjectMember = (query?: ProjectMemberQuery): AxiosPromise<ProjectMemberVO[]> => {
  return request({
    url: '/system/projectMember/list',
    method: 'get',
    params: query
  });
};


/**
 * 查询项目组内成员列表
 * @param query
 * @returns {*}
 */

export const listAllProjectMember = (query?: ProjectMemberQuery): AxiosPromise<ProjectMemberVO[]> => {
  return request({
    url: '/system/projectMember/allList',
    method: 'get',
    params: query
  });
};
/**
 * 查询项目组内成员详细
 * @param id
 */
export const getProjectMember = (id: string | number): AxiosPromise<ProjectMemberVO> => {
  return request({
    url: '/system/projectMember/' + id,
    method: 'get'
  });
};

/**
 * 新增项目组内成员
 * @param data
 */
export const addProjectMember = (data: ProjectMemberForm) => {
  return request({
    url: '/system/projectMember',
    method: 'post',
    data: data
  });
};

/**
 * 修改项目组内成员
 * @param data
 */
export const updateProjectMember = (data: ProjectMemberForm) => {
  return request({
    url: '/system/projectMember',
    method: 'put',
    data: data
  });
};

/**
 * 删除项目组内成员
 * @param id
 */
export const delProjectMember = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/projectMember/' + id,
    method: 'delete'
  });
};
