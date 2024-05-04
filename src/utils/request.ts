import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '@/store/modules/user';
import { getToken } from '@/utils/auth';
import { tansParams, blobValidate } from '@/utils/ruoyi';
import cache from '@/plugins/cache';
import { HttpStatus } from '@/enums/RespEnum';
import { errorCode } from '@/utils/errorCode';
import { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
import FileSaver from 'file-saver';
import { getLanguage } from '@/lang';
import { encryptBase64, encryptWithAes, generateAesKey, decryptWithAes, decryptBase64 } from '@/utils/crypto';
import { encrypt, decrypt } from '@/utils/jsencrypt';

const encryptHeader = 'encrypt-key';
let downloadLoadingInstance: LoadingInstance;
// 是否显示重新登录
export const isRelogin = { show: false };
export const globalHeaders = () => {
  return {
    Authorization: 'Bearer ' + getToken(),
    clientid: import.meta.env.VITE_APP_CLIENT_ID
  };
};

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers['clientid'] = import.meta.env.VITE_APP_CLIENT_ID;
// Create an axios instance
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000
});

// request interceptor
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Corresponding international resource file suffix
    config.headers['Content-Language'] = getLanguage();

    const isToken = (config.headers || {}).isToken === false;
    // Is it necessary to prevent repeated submission of data
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;
    // Whether encryption is required
    const isEncrypt = (config.headers || {}).isEncrypt === 'true';
    if (getToken() && !isToken) {
      config.headers['Authorization'] = 'Bearer ' + getToken(); // Let each request carry a custom token.
    }
    // get request mapping params parameters
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }

    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime()
      };
      const sessionObj = cache.session.getJSON('sessionObj');
      if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
        cache.session.setJSON('sessionObj', requestObj);
      } else {
        const s_url = sessionObj.url; // request address
        const s_data = sessionObj.data; // request data
        const s_time = sessionObj.time; // request time
        const interval = 500; // Interval time (ms), less than this time is considered a duplicate submission
        if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
          const message = 'Data is being processed, please do not resubmit';
          console.warn(`[${s_url}]: ` + message);
          return Promise.reject(new Error(message));
        } else {
          cache.session.setJSON('sessionObj', requestObj);
        }
      }
    }
    // When parameter encryption is turned on
    if (isEncrypt && (config.method === 'post' || config.method === 'put')) {
      // Generate an AES key
      const aesKey = generateAesKey();
      config.headers[encryptHeader] = encrypt(encryptBase64(aesKey));
      config.data = typeof config.data === 'object' ? encryptWithAes(JSON.stringify(config.data), aesKey) : encryptWithAes(config.data, aesKey);
    }
    // FormData data goes to request header Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: any) => {
    console.log(error);
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  (res: AxiosResponse) => {
    // Encrypted AES key
    const keyStr = res.headers[encryptHeader];
    // encryption
    if (keyStr != null && keyStr != '') {
      const data = res.data;
      // Request body AES decryption
      const base64Str = decrypt(keyStr);
      // Base64 decoding to get the AES key of the request header
      const aesKey = decryptBase64(base64Str.toString());
      // aesKey decode data
      const decryptData = decryptWithAes(data, aesKey);
      // Convert the result (resulting in a JSON string) to JSON
      res.data = JSON.parse(decryptData);
    }
    // If the status code is not set, the default success status is
    const code = res.data.code || HttpStatus.SUCCESS;
    // Get error message
    const msg = errorCode[code] || res.data.msg || errorCode['default'];
    // Binary data is returned directly
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data;
    }
    if (code === 401) {
      // prettier-ignore
      if (!isRelogin.show) {
        isRelogin.show = true;
        ElMessageBox.confirm('The login status has expired. You can continue to stay on this page or log in again.', 'System Reminder', {
          confirmButtonText: 'Login Again',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          isRelogin.show = false;
          useUserStore().logout().then(() => {
              location.href = import.meta.env.VITE_APP_CONTEXT_PATH + 'index';
            });
        }).catch(() => {
          isRelogin.show = false;
        });
      }
      return Promise.reject('Invalid session, or the session has expired, please log in again.');
    } else if (code === HttpStatus.SERVER_ERROR) {
      console.log(msg);
      ElMessage({ message: msg, type: 'error' });
      return Promise.reject(new Error(msg));
    } else if (code === HttpStatus.WARN) {
      ElMessage({ message: msg, type: 'warning' });
      return Promise.reject(new Error(msg));
    } else if (code !== HttpStatus.SUCCESS) {
      ElNotification.error({ title: msg });
      return Promise.reject('error');
    } else {
      return Promise.resolve(res.data);
    }
  },
  (error: any) => {
    let { message } = error;
    if (message == 'Network Error') {
      message = 'Connection Error';
    } else if (message.includes('timeout')) {
      message = 'Request Timeout';
    } else if (message.includes('Request failed with status code')) {
      message = 'System interface' + message.substr(message.length - 3) + 'Error';
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 });
    return Promise.reject(error);
  }
);
// General Download Method
export function download(url: string, params: any, fileName: string) {
  downloadLoadingInstance = ElLoading.service({ text: 'Downloading data, please wait.', background: 'rgba(0, 0, 0, 0.7)' });
  // prettier-ignore
  return service.post(url, params, {
      transformRequest: [
        (params: any) => {
          return tansParams(params);
        }
      ],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob'
    }).then(async (resp: any) => {
      const isLogin = blobValidate(resp);
      if (isLogin) {
        const blob = new Blob([resp]);
        FileSaver.saveAs(blob, fileName);
      } else {
        const resText = await resp.data.text();
        const rspObj = JSON.parse(resText);
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
        ElMessage.error(errMsg);
      }
      downloadLoadingInstance.close();
    }).catch((r: any) => {
      console.error(r);
      ElMessage.error('There was an error downloading the file, please contact the administrator.！');
      downloadLoadingInstance.close();
    });
}
// 导出 axios 实例
export default service;
