// translate router.meta.title, be used in breadcrumb sidebar tagsview
import i18n from '@/lang/index';

/**
 * Get the internationalized route and return it natively if it does not exist
 * @param title Route name
 * @returns {string}
 */
export const translateRouteTitle = (title: string): string => {
  const hasKey = i18n.global.te('route.' + title);
  if (hasKey) {
    const translatedTitle = i18n.global.t('route.' + title);
    return translatedTitle;
  }
  return title;
};
