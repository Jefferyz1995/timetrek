import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 查询日历数据
 * @returns {*}
 */
export const getProjectTask = (): AxiosPromise => {
  return request({
    url: '/system/projectTask/allList',
    method: 'get'
  });
};
