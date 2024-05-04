import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectMemberVO, ProjectMemberForm, ProjectMemberQuery } from '@/api/system/projectMember/types';

/**
 * Query the list of members in the project team
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
 * Query the list of members in the project team
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
 * Query details of members in the project team
 * @param id
 */
export const getProjectMember = (id: string | number): AxiosPromise<ProjectMemberVO> => {
  return request({
    url: '/system/projectMember/' + id,
    method: 'get'
  });
};

/**
 * Add new members to the project team
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
 * Modify project team members
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
 * Delete project team members
 * @param id
 */
export const delProjectMember = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/projectMember/' + id,
    method: 'delete'
  });
};
