import { to as tos } from 'await-to-js';
import router from './router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { getToken } from '@/utils/auth';
import { isHttp } from '@/utils/validate';
import { isRelogin } from '@/utils/request';
import useUserStore from '@/store/modules/user';
import useSettingsStore from '@/store/modules/settings';
import usePermissionStore from '@/store/modules/permission';

NProgress.configure({ showSpinner: false });
const whiteList = ['/login', '/register', '/social-callback'];

router.beforeEach(async (to, from, next) => {
  NProgress.start();
  // debugger
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title as string);
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' });
      NProgress.done();
    } else if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true;

        const [err] = await tos(useUserStore().getInfo());
        if (err) {
          await useUserStore().logout();
          ElMessage.error(err);
          next({ path: '/' });
        } else {
          isRelogin.show = false;
          const accessRoutes = await usePermissionStore().generateRoutes();

          accessRoutes.forEach((route) => {
            if (!isHttp(route.path)) {
              router.addRoute(route);
            }
          });
          next({ ...to, replace: true });
        }
      } else {
        next();
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {

      next();
    } else {
      next(`/login?redirect=${to.fullPath}`);
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
