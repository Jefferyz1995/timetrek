import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectGroupVO, ProjectGroupForm, ProjectGroupQuery } from '@/api/system/projectGroup/types';

/**
 * Query project group list
 * @param query
 * @returns {*}
 */

export const listProjectGroup = (query?: ProjectGroupQuery): AxiosPromise<ProjectGroupVO[]> => {
  return request({
    url: '/system/projectGroup/list',
    method: 'get',
    params: query
  });
};

/**
 * Query project group details
 * @param id
 */
export const getProjectGroup = (id: string | number): AxiosPromise<ProjectGroupVO> => {
  return request({
    url: '/system/projectGroup/' + id,
    method: 'get'
  });
};

/**
 * Add new project group
 * @param data
 */
export const addProjectGroup = (data: ProjectGroupForm) => {
  return request({
    url: '/system/projectGroup',
    method: 'post',
    data: data
  });
};

/**
 * modify project group
 * @param data
 */
export const updateProjectGroup = (data: ProjectGroupForm) => {
  return request({
    url: '/system/projectGroup',
    method: 'put',
    data: data
  });
};

/**
 * delete project group
 * @param id
 */
export const delProjectGroup = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/projectGroup/' + id,
    method: 'delete'
  });
};
