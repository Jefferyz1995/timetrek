import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectTaskVO, ProjectTaskForm, ProjectTaskQuery } from '@/api/system/projectTask/types';

/**
 * 查询项目的任务列表
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
 * 查询项目的任务详细
 * @param id
 */
export const getProjectTask = (id: string | number): AxiosPromise<ProjectTaskVO> => {
  return request({
    url: '/system/projectTask/' + id,
    method: 'get'
  });
};

/**
 * 新增项目的任务
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
 * 修改项目的任务
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
 * 删除项目的任务
 * @param id
 */
export const delProjectTask = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/projectTask/' + id,
    method: 'delete'
  });
};
