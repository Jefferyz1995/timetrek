<template>
  <div>
    <el-dropdown trigger="click" @command="handleSetSize">
      <div class="size-icon--style">
        <svg-icon class-name="size-icon" icon-class="size" />
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item of sizeOptions" :key="item.value" :disabled="size === item.value" :command="item.value">
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import useAppStore from "@/store/modules/app";

const appStore = useAppStore();
const size = computed(() => appStore.size);

const sizeOptions = ref([
    { label: "Large", value: "large" },
    { label: "Default", value: "default" },
    { label: "Small", value: "small" },
]);

const handleSetSize = (size: string) => {
    appStore.setSize(size);
}
</script>

<style lang="scss" scoped>
.size-icon--style {
  font-size: 18px;
  line-height: 50px;
  padding-right: 7px;
}
</style>
