import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectGroupVO, ProjectGroupForm, ProjectGroupQuery } from '@/api/system/projectGroup/types';

/**
 * 查询项目组列表
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
 * 查询项目组详细
 * @param id
 */
export const getProjectGroup = (id: string | number): AxiosPromise<ProjectGroupVO> => {
  return request({
    url: '/system/projectGroup/' + id,
    method: 'get'
  });
};

/**
 * 新增项目组
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
 * 修改项目组
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
 * 删除项目组
 * @param id
 */
export const delProjectGroup = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/projectGroup/' + id,
    method: 'delete'
  });
};
