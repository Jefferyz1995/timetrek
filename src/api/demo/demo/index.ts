import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DemoVO, DemoForm, DemoQuery } from '@/api/demo/demo/types';

/**
 * Query the testing list
 * @param query
 * @returns {*}
 */
export const listDemo = (query?: DemoQuery): AxiosPromise<DemoVO[]> => {
  return request({
    url: '/demo/demo/list',
    method: 'get',
    params: query
  });
};

/**
 * query the detail of the testing list
 * @param id
 */
export const getDemo = (id: string | number): AxiosPromise<DemoVO> => {
  return request({
    url: '/demo/demo/' + id,
    method: 'get'
  });
};

/**
 * add test data
 * @param data
 */
export const addDemo = (data: DemoForm) => {
  return request({
    url: '/demo/demo',
    method: 'post',
    data: data
  });
};

/**
 * update test data
 * @param data
 */
export const updateDemo = (data: DemoForm) => {
  return request({
    url: '/demo/demo',
    method: 'put',
    data: data
  });
};

/**
 * delete the test data
 * @param id
 */
export const delDemo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/demo/' + id,
    method: 'delete'
  });
};
