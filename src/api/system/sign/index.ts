import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SignVO, SignForm, SignQuery } from '@/api/system/sign/types';

/**
 * Query user clock-in list
 * @param query
 * @returns {*}
 */

export const listSign = (query?: SignQuery): AxiosPromise<SignVO[]> => {
  return request({
    url: '/system/sign/list',
    method: 'get',
    params: query
  });
};

/**
 * Query user clock-in details
 * @param id
 */
export const getSign = (id: string | number): AxiosPromise<SignVO> => {
  return request({
    url: '/system/sign/' + id,
    method: 'get'
  });
};

/**
 * Add new user clock-in
 * @param data
 */
export const addSign = (data: SignForm) => {
  return request({
    url: '/system/sign',
    method: 'post',
    data: data
  });
};

/**
 * modify user clock-in
 * @param data
 */
export const updateSign = (data: SignForm) => {
  return request({
    url: '/system/sign',
    method: 'put',
    data: data
  });
};

/**
 * delete user clock-in
 * @param id
 */
export const delSign = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/sign/' + id,
    method: 'delete'
  });
};
