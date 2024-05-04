<template>
  <div class="el-tree-select">
    <el-select
      style="width: 100%"
      v-model="valueId"
      ref="treeSelect"
      :filterable="true"
      :clearable="true"
      @clear="clearHandle"
      :filter-method="selectFilterData"
      :placeholder="placeholder"
    >
      <el-option :value="valueId" :label="valueTitle">
        <el-tree
          id="tree-option"
          ref="selectTree"
          :accordion="accordion"
          :data="options"
          :props="objMap"
          :node-key="objMap.value"
          :expand-on-click-node="false"
          :default-expanded-keys="defaultExpandedKey"
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
        ></el-tree>
      </el-option>
    </el-select>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  /* Configuration items */
  objMap: {
    type: Object,
    default: () => {
      return {
        value: 'id',
        label: 'label',
        children: 'children'
      }
    }
  },

  accordion: {
    type: Boolean,
    default: () => {
      return false
    }
  },

  value: {
    type: [String, Number],
    default: ''
  },

  options: {
    type: Array,
    default: () => []
  },

  placeholder: {
    type: String,
    default: ''
  }
})


const selectTree = ref<ElTreeSelectInstance>();

const emit = defineEmits(['update:value']);

const valueId = computed({
  get: () => props.value,
  set: (val) => {
    emit('update:value', val)
  }
});
const valueTitle = ref('');
const defaultExpandedKey = ref<any[]>([]);

const initHandle = () => {
  nextTick(() => {
    const selectedValue = valueId.value;
    if (selectedValue !== null && typeof (selectedValue) !== 'undefined') {
      const node = selectTree.value?.getNode(selectedValue)
      if (node) {
        valueTitle.value = node.data[props.objMap.label]
        selectTree.value?.setCurrentKey(selectedValue) // default selected
        defaultExpandedKey.value = [selectedValue] // default expanded
      }
    } else {
      clearHandle()
    }
  })
}
const handleNodeClick = (node: any) => {
  valueTitle.value = node[props.objMap.label]
  valueId.value = node[props.objMap.value];
  defaultExpandedKey.value = [];
  selectTree.value?.blur()
  selectFilterData('')
}
const selectFilterData = (val: any) => {
  selectTree.value?.filter(val)
}
const filterNode = (value: any, data: any) => {
  if (!value) return true
  return data[props.objMap['label']].indexOf(value) !== -1
}
const clearHandle = () => {
  valueTitle.value = ''
  valueId.value = ''
  defaultExpandedKey.value = [];
  clearSelected()
}
const clearSelected = () => {
  const allNode = document.querySelectorAll('#tree-option .el-tree-node')
  allNode.forEach((element) => element.classList.remove('is-current'))
}

onMounted(() => {
  initHandle()
})

watch(valueId, () => {
  initHandle();
})
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.module.scss";

.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  padding: 0;
  background-color: #fff;
  height: auto;
}

.el-select-dropdown__item.selected {
  font-weight: normal;
}

ul li .el-tree .el-tree-node__content {
  height: auto;
  padding: 0 20px;
  box-sizing: border-box;
}

:deep(.el-tree-node__content:hover),
:deep(.el-tree-node__content:active),
:deep(.is-current > div:first-child),
:deep(.el-tree-node__content:focus) {
  background-color: mix(#fff, $--color-primary, 90%);
  color: $--color-primary;
}
</style>
