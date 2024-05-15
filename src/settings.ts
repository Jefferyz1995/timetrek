const setting: DefaultSettings = {

  title: import.meta.env.VITE_APP_TITLE,

  theme: 'rgb(19 49 79)',


  sideTheme: 'theme-dark',

  showSettings: true,


  topNav: false,


  tagsView: true,


  fixedHeader: false,


  sidebarLogo: true,


  dynamicTitle: false,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production',

  animationEnable: false,

  dark: false
};
export default setting;
