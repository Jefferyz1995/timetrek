import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SignVO, SignForm, SignQuery } from '@/api/system/sign/types';

/**
 * 查询用户签到列表
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
 * 查询用户签到详细
 * @param id
 */
export const getSign = (id: string | number): AxiosPromise<SignVO> => {
  return request({
    url: '/system/sign/' + id,
    method: 'get'
  });
};

/**
 * 新增用户签到
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
 * 修改用户签到
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
 * 删除用户签到
 * @param id
 */
export const delSign = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/sign/' + id,
    method: 'delete'
  });
};
