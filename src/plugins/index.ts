import modal from './modal';
import tab from './tab';
import download from './download';
import cache from './cache';
import auth from './auth';

import { App } from 'vue';

export default function installPlugin(app: App) {
  // Tab operation
  app.config.globalProperties.$tab = tab;

  // Modal object
  app.config.globalProperties.$modal = modal;

  // Cache object
  app.config.globalProperties.$cache = cache;

  // download file
  app.config.globalProperties.$download = download;

  // Authentication object
  app.config.globalProperties.$auth = auth;
}
