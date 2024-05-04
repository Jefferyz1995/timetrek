import { useTagsViewStore } from '@/store/modules/tagsView';
import router from '@/router';
import { TagView, RouteLocationRaw } from 'vue-router';

export default {
  /**
   * Refresh the current tab page
   * @param obj label object
   */
  async refreshPage(obj?: TagView): Promise<void> {
    const { path, query, matched } = router.currentRoute.value;
    if (obj === undefined) {
      matched.forEach((m) => {
        if (m.components && m.components.default && m.components.default.name) {
          if (!['Layout', 'ParentView'].includes(m.components.default.name)) {
            obj = { name: m.components.default.name, path: path, query: query };
          }
        }
      });
    }
    let query1: undefined | {} = {};
    let path1: undefined | string = '';
    if (obj) {
      query1 = obj.query;
      path1 = obj.path;
    }
    await useTagsViewStore().delCachedView(obj);
    await router.replace({
      path: '/redirect' + path1,
      query: query1
    });
  },
  // Close the current tab and open a new tab
  closeOpenPage(obj: RouteLocationRaw): void {
    useTagsViewStore().delView(router.currentRoute.value);
    if (obj !== undefined) {
      router.push(obj);
    }
  },
  // Close the specified tab
  async closePage(obj?: TagView): Promise<{ visitedViews: TagView[]; cachedViews: string[] } | any> {
    if (obj === undefined) {
      // prettier-ignore
      const { visitedViews } = await useTagsViewStore().delView(router.currentRoute.value) as any
      const latestView = visitedViews.slice(-1)[0];
      if (latestView) {
        return router.push(latestView.fullPath);
      }
      return router.push('/');
    }
    return useTagsViewStore().delView(obj);
  },
  // Close all tabs
  closeAllPage() {
    return useTagsViewStore().delAllViews();
  },
  // Close the left tab
  closeLeftPage(obj?: TagView) {
    return useTagsViewStore().delLeftTags(obj || router.currentRoute.value);
  },
  // Close the right tab
  closeRightPage(obj?: TagView) {
    return useTagsViewStore().delRightTags(obj || router.currentRoute.value);
  },
  // Close other tabs
  closeOtherPage(obj?: TagView) {
    return useTagsViewStore().delOthersViews(obj || router.currentRoute.value);
  },
  /**
   * Open tab
   * @param url
   * @param title
   * @param query
   */
  openPage(url: string, title?: string, query?: any) {
    const obj = { path: url, query: { ...query, title } };
    return router.push(obj);
  },
  /**
   * Modify tabs
   * @param obj
   */
  updatePage(obj: TagView) {
    return useTagsViewStore().updateVisitedView(obj);
  }
};
