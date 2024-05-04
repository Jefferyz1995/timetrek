import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectVO, ProjectForm, ProjectQuery } from '@/api/system/project/types';

/**
 * Query project list
 * @param query
 * @returns {*}
 */

export const listProject = (query?: ProjectQuery): AxiosPromise<ProjectVO[]> => {
  return request({
    url: '/system/project/list',
    method: 'get',
    params: query
  });
};
export const listAllProject = (query?: ProjectQuery): AxiosPromise<ProjectVO[]> => {
  return request({
    url: '/system/project/allList',
    method: 'get',
    params: query
  });
};

/**
 * Query project details
 * @param id
 */
export const getProject = (id: string | number): AxiosPromise<ProjectVO> => {
  return request({
    url: '/system/project/getInfo/' + id,
    method: 'get'
  });
};

/**
 * add new project
 * @param data
 */
export const addProject = (data: ProjectForm) => {
  return request({
    url: '/system/project',
    method: 'post',
    data: data
  });
};

/**
 * Modify project
 * @param data
 */
export const updateProject = (data: ProjectForm) => {
  return request({
    url: '/system/project',
    method: 'put',
    data: data
  });
};

/**
 * Delete project
 * @param id
 */
export const delProject = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/project/' + id,
    method: 'delete'
  });
};
