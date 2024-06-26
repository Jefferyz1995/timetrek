export const useDictStore = defineStore('dict', () => {
  const dict = ref<
    Array<{
      key: string;
      value: DictDataOption[];
    }>
  >([]);

  /**
   * Get dictionary
   * @param _key Dictionary key
   */
  const getDict = (_key: string): DictDataOption[] | null => {
    if (_key == null && _key == '') {
      return null;
    }
    try {
      for (let i = 0; i < dict.value.length; i++) {
        if (dict.value[i].key == _key) {
          return dict.value[i].value;
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  /**
   * set Dictionary
   * @param _key Dictionary key
   * @param _value Dictionary value
   */
  const setDict = (_key: string, _value: DictDataOption[]) => {
    if (_key !== null && _key !== '') {
      dict.value.push({
        key: _key,
        value: _value
      });
    }
  };

  /**
   * delete Dictionary
   * @param _key
   */
  const removeDict = (_key: string): boolean => {
    let bln = false;
    try {
      for (let i = 0; i < dict.value.length; i++) {
        if (dict.value[i].key == _key) {
          dict.value.splice(i, 1);
          return true;
        }
      }
    } catch (e) {
      bln = false;
    }
    return bln;
  };

  /**
   * clear Dictionary
   */
  const cleanDict = (): void => {
    dict.value = [];
  };

  return {
    dict,
    getDict,
    setDict,
    removeDict,
    cleanDict
  };
});

export default useDictStore;
