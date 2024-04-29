import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OfferVO, OfferForm, OfferQuery } from '@/api/system/offer/types';

/**
 * 查询招聘列表
 * @param query
 * @returns {*}
 */

export const listOffer = (query?: OfferQuery): AxiosPromise<OfferVO[]> => {
  return request({
    url: '/system/offer/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询招聘详细
 * @param id
 */
export const getOffer = (id: string | number): AxiosPromise<OfferVO> => {
  return request({
    url: '/system/offer/' + id,
    method: 'get'
  });
};

/**
 * 新增招聘
 * @param data
 */
export const addOffer = (data: OfferForm) => {
  return request({
    url: '/system/offer',
    method: 'post',
    data: data
  });
};

/**
 * 修改招聘
 * @param data
 */
export const updateOffer = (data: OfferForm) => {
  return request({
    url: '/system/offer',
    method: 'put',
    data: data
  });
};

/**
 * 删除招聘
 * @param id
 */
export const delOffer = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/offer/' + id,
    method: 'delete'
  });
};
