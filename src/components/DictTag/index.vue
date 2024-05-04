<template>
  <div>
    <template v-for="(item, index) in options">
      <template v-if="values.includes(item.value)">
        <span v-if="(item.elTagType === 'default' || item.elTagType === '') && (item.elTagClass === '' || item.elTagClass == null)"
              :key="item.value" :index="index" :class="item.elTagClass">
          {{ item.label + " " }}
        </span>
        <el-tag
          v-else
          :disable-transitions="true"
          :key="item.value + ''"
          :index="index"
          :type="(item.elTagType === 'primary' || item.elTagType === 'default')? '' : item.elTagType"
          :class="item.elTagClass"
        >
          {{ item.label + " " }}
        </el-tag>
      </template>
    </template>
    <template v-if="unmatch && showValue">
      {{ unmatchArray }}
    </template>
  </div>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';


const props = defineProps({
  // data
  options: {
    type: Array as PropType<DictDataOption[]>,
    default: null,
  },
  // current value
  value: [Number, String, Array] as PropType<number | string | Array<number | string>>,
  // When no matching data is found, value is displayed
  showValue: propTypes.bool.def(true),
  separator: propTypes.string.def(","),
});
const values = computed(() => {
  if (props.value === '' || props.value === null || typeof props.value === "undefined") return []
  return Array.isArray(props.value) ? props.value.map(item => '' + item) : String(props.value).split(props.separator);
});

const unmatch = computed(() => {
  if (props.options?.length == 0 || props.value === '' || props.value === null || typeof props.value === "undefined") return false
  // The value passed in is not an array
  values.value.forEach(item => {
    if (!props.options.some(v => v.value === item)) {
      return true // If there are no matches, set the flag to true
    }
  })
  return false
});

const unmatchArray = computed(() => {
// record unmatched items
  const itemUnmatchArray: Array<string | number> = [];
  if (props.value !== '' && props.value !== null && typeof props.value !== "undefined") {
    values.value.forEach(item => {
      if (!props.options.some(v => v.value === item)) {
        itemUnmatchArray.push(item);
      }
    })
  }
  // No value, no display
  return handleArray(itemUnmatchArray);
});

const handleArray = (array: Array<string | number>) => {
  if (array.length === 0) return "";
  return array.reduce((pre, cur) => {
    return pre + " " + cur;
  });
}
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
