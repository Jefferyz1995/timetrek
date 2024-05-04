import type { ComponentInternalInstance as ComponentInstance, PropType as VuePropType } from 'vue';

declare global {
  /** vue Instance */
  declare type ComponentInternalInstance = ComponentInstance;
  /**vue */
  declare type PropType<T> = VuePropType<T>;

  /**
   * Interface field hidden properties
   */
  declare interface FieldOption {
    key: number;
    label: string;
    visible: boolean;
    children?: Array<FieldOption>;
  }

  /**
   * Popup window properties
   */
  declare interface DialogOption {
    /**
     * popup window title
     */
    title?: string;
    /**
     * display?
     */
    visible: boolean;
  }

  declare interface UploadOption {
    /** Set upload request headers */
    headers: { [key: string]: any };

    /** Upload address */
    url: string;
  }

  /**
   * Import properties
   */
  declare interface ImportOption extends UploadOption {
    /** Whether to display the popup layer */
    open: boolean;
    /** Popup layer title */
    title: sPopup layer titletring;
    /** disable upload? */
    isUploading: boolean;

    /** other permettre */
    [key: string]: any;
  }
  /**
   * Dictionary data and data configuration
   */
  declare interface DictDataOption {
    label: string;
    value: string;
    elTagType?: ElTagType;
    elTagClass?: string;
  }

  declare interface BaseEntity {
    createBy?: any;
    createDept?: any;
    createTime?: string;
    updateBy?: any;
    updateTime?: any;
  }

  /**
   * paged data
   * T : form data
   * D : qurey the data
   */
  declare interface PageData<T, D> {
    form: T;
    queryParams: D;
    rules: ElFormRules;
  }
  /**
   * Pagination query parameters
   */
  declare interface PageQuery {
    pageNum: number;
    pageSize: number;
  }
}
export {};
