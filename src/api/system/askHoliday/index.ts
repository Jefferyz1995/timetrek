import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AskHolidayVO, AskHolidayForm, AskHolidayQuery } from '@/api/system/askHoliday/types';

/**
 * Check the leave application list
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
 * Query Leave Application detail
 * @param id
 */
export const getAskHoliday = (id: string | number): AxiosPromise<AskHolidayVO> => {
  return request({
    url: '/system/askHoliday/' + id,
    method: 'get'
  });
};

/**
 * Add a new leave application
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
 * Modify leave application
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
 * Delete leave application
 * @param id
 */
export const delAskHoliday = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/askHoliday/' + id,
    method: 'delete'
  });
};
