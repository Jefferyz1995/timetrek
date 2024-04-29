import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AskHolidayVO, AskHolidayForm, AskHolidayQuery } from '@/api/system/askHoliday/types';

/**
 * 查询请假申请列表
 * @param query
 * @returns {*}
 */

export const listAskHoliday = (query?: AskHolidayQuery): AxiosPromise<AskHolidayVO[]> => {
  return request({
    url: '/system/askHoliday/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询请假申请详细
 * @param id
 */
export const getAskHoliday = (id: string | number): AxiosPromise<AskHolidayVO> => {
  return request({
    url: '/system/askHoliday/' + id,
    method: 'get'
  });
};

/**
 * 新增请假申请
 * @param data
 */
export const addAskHoliday = (data: AskHolidayForm) => {
  return request({
    url: '/system/askHoliday',
    method: 'post',
    data: data
  });
};

/**
 * 修改请假申请
 * @param data
 */
export const updateAskHoliday = (data: AskHolidayForm) => {
  return request({
    url: '/system/askHoliday',
    method: 'put',
    data: data
  });
};

/**
 * 删除请假申请
 * @param id
 */
export const delAskHoliday = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/askHoliday/' + id,
    method: 'delete'
  });
};
