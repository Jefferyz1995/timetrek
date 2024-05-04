import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ClientVO, ClientForm, ClientQuery } from '@/api/system/client/types';

/**
 * Query client management list
 * @param query
 * @returns {*}
 */

export const listClient = (query?: ClientQuery): AxiosPromise<ClientVO[]> => {
  return request({
    url: '/system/client/list',
    method: 'get',
    params: query
  });
};

/**
 * Query client management details
 * @param id
 */
export const getClient = (id: string | number): AxiosPromise<ClientVO> => {
  return request({
    url: '/system/client/' + id,
    method: 'get'
  });
};

/**
 * Add client management
 * @param data
 */
export const addClient = (data: ClientForm) => {
  return request({
    url: '/system/client',
    method: 'post',
    data: data
  });
};

/**
 * Modify client management
 * @param data
 */
export const updateClient = (data: ClientForm) => {
  return request({
    url: '/system/client',
    method: 'put',
    data: data
  });
};

/**
 * Delete client management
 * @param id
 */
export const delClient = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/client/' + id,
    method: 'delete'
  });
};

/**
 * Status modification
 * @param id 
 * @param status
 */
export function changeStatus(id: number | string, status: string) {
  const data = {
    id,
    status
  };
  return request({
    url: '/system/client/changeStatus',
    method: 'put',
    data: data
  });
}
