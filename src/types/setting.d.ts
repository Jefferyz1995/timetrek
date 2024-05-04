declare type DefaultSettings = {
  /**
   * Web Page title
   */
  title?: string;

  /**
   * sidebar theme theme-dark | theme-light
   */
  sideTheme?: string;

  /**
   * Whether to display system layout settings
   */
  showSettings?: boolean;

  /**
   * Whether to display top navigation
   */
  topNav?: boolean;

  /**
   * Whether to display multi-tab navigation
   */
  tagsView?: boolean;
  /**
   * fixed header
   */
  fixedHeader?: boolean;
  /**
   * Whether to display the sidebar logo
   */
  sidebarLogo?: boolean;
  /**
   * Navigation bar layout
   */
  layout?: string;
  /**
   * theme
   */
  theme?: string;

  /**
   * size fot layout
   */
  size?: string;

  /**
   * Lanaguage
   */
  language?: string;

  /**
   * Whether to display dynamic titles
   */
  dynamicTitle?: boolean;
  /**
   * to enable animation effects
   */
  animationEnable?: boolean;
  /**
   *  Dark Mode？
   *
   * true: Dark mode
   * false: lig mode
   */
  dark?: boolean;

  errorLog?: string;
};
