/**
 * @module initWebSocket
 * @module websocketonopen
 * @module websocketonerror
 * @module websocketclose
 * @module resetHeart
 * @module sendSocketHeart
 * @module reconnect
 * @module sendMsg
 * @module websocketonmessage
 * @module test
 * @description
 * @param {any} url
 * @param {any} websocket
 * @param {any} heartTime
 * @param {number} socketHeart
 * @param {number} HeartTimeOut
 * @param {number} socketError
 */

import { getToken } from '@/utils/auth';
import useNoticeStore from '@/store/modules/notice';
import { ElNotification } from "element-plus";

const { addNotice } = useNoticeStore();

let socketUrl: any = '';
let websocket: any = null;
let heartTime: any = null;
let socketHeart = 0 as number;
const HeartTimeOut = 10000;
let socketError = 0 as number;

// initial socket
export const initWebSocket = (url: any) => {
  if (import.meta.env.VITE_APP_WEBSOCKET === 'false') {
    return;
  }
  socketUrl = url;
  // initial websocket
  websocket = new WebSocket(url + '?Authorization=Bearer ' + getToken() + '&clientid=' + import.meta.env.VITE_APP_CLIENT_ID);
  websocketonopen();
  websocketonmessage();
  websocketonerror();
  websocketclose();
  sendSocketHeart();
  return websocket;
};

// socket connection success
export const websocketonopen = () => {
  websocket.onopen = function () {
    console.log('success to Connect to websocket');
    resetHeart();
  };
};

// socket connection fail
export const websocketonerror = () => {
  websocket.onerror = function (e: any) {
    console.log('failed to connect websocket', e);
  };
};

// socket disconnect
export const websocketclose = () => {
  websocket.onclose = function (e: any) {
    console.log('Disconnect', e);
  };
};

// socket reset heartbeat
export const resetHeart = () => {
  socketHeart = 0;
  socketError = 0;
  clearInterval(heartTime);
  sendSocketHeart();
};

// socket heartbeat sending
export const sendSocketHeart = () => {
  heartTime = setInterval(() => {
    // If the connection is normal, send a heartbeat
    if (websocket.readyState == 1) {
      // if (socketHeart <= 30) {
      websocket.send(
        JSON.stringify({
          type: 'ping'
        })
      );
      socketHeart = socketHeart + 1;
    } else {
      // reconnect
      reconnect();
    }
  }, HeartTimeOut);
};

// socket reconnect
export const reconnect = () => {
  if (socketError <= 2) {
    clearInterval(heartTime);
    initWebSocket(socketUrl);
    socketError = socketError + 1;
    // eslint-disable-next-line prettier/prettier
    console.log('socket reconnect', socketError);
  } else {
    // eslint-disable-next-line prettier/prettier
    console.log('The number of retries has been exhausted');
    clearInterval(heartTime);
  }
};

// socket send data
export const sendMsg = (data: any) => {
  websocket.send(data);
};

// socket receive data
export const websocketonmessage = () => {
  websocket.onmessage = function (e: any) {
    if (e.data.indexOf('heartbeat') > 0) {
      resetHeart();
    }
    if (e.data.indexOf('ping') > 0) {
      return;
    }
    addNotice({
      message: e.data,
      read: false,
      time: new Date().toLocaleString()
    });
    ElNotification({
      title: 'Message',
      message: e.data,
      type: 'success',
      duration: 3000
    })
    return e.data;
  };
};
