import request from '@/utils/request';

// link account
export function authBinding(source: string) {
  return request({
    url: '/auth/binding/' + source,
    method: 'get'
  });
}

// unlink account
export function authUnlock(authId: string) {
  return request({
    url: '/auth/unlock/' + authId,
    method: 'delete'
  });
}
//Get authorization list
export function getAuthList() {
  return request({
    url: '/system/social/list',
    method: 'get'
  });
}
