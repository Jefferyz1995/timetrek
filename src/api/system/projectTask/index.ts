import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectTaskVO, ProjectTaskForm, ProjectTaskQuery } from '@/api/system/projectTask/types';

/**
 * Query the task list of a project
 * @param query
 * @returns {*}
 */

export const listProjectTask = (query?: ProjectTaskQuery): AxiosPromise<ProjectTaskVO[]> => {
  return request({
    url: '/system/projectTask/list',
    method: 'get',
    params: query
  });
};

/**
 * Query project task details
 * @param id
 */
export const getProjectTask = (id: string | number): AxiosPromise<ProjectTaskVO> => {
  return request({
    url: '/system/projectTask/' + id,
    method: 'get'
  });
};

/**
 * Add new project tasks
 * @param data
 */
export const addProjectTask = (data: ProjectTaskForm) => {
  return request({
    url: '/system/projectTask',
    method: 'post',
    data: data
  });
};

/**
 * Modify project tasks
 * @param data
 */
export const updateProjectTask = (data: ProjectTaskForm) => {
  return request({
    url: '/system/projectTask',
    method: 'put',
    data: data
  });
};

/**
 * Delete project tasks
 * @param id
 */
export const delProjectTask = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/projectTask/' + id,
    method: 'delete'
  });
};
