<template>
  <div :class="{ 'has-logo': showLogo }" :style="{ backgroundColor: '#041628' }">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar class="scrollbar-box" :class="sideTheme" wrap-class="scrollbar-wrapper">
      <transition :enter-active-class="proxy?.animate.menuSearchAnimate.enter" mode="out-in">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          background-color="#041628"
          text-color="#ccc"
          :unique-opened="true"
          active-text-color="#e2ca67"
          :collapse-transition="false"
          mode="vertical"
        >
          <sidebar-item v-for="(route, index) in sidebarRouters" :key="route.path + index" :item="route" :base-path="route.path" />
        </el-menu>
      </transition>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import variables from '@/assets/styles/variables.module.scss'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import { RouteOption } from "vue-router";
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const route = useRoute();
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarRouters =  computed<RouteOption[]>(() => permissionStore.sidebarRouters);
const showLogo = computed(() => settingsStore.sidebarLogo);
const sideTheme = computed(() => settingsStore.sideTheme);
const theme = computed(() => settingsStore.theme);
const isCollapse = computed(() => !appStore.sidebar.opened);

const activeMenu = computed(() => {
    const { meta, path } = route;
    // if set path, the sidebar will highlight the path you set
    if (meta.activeMenu) {
        return meta.activeMenu;
    }
    return path;
})

const bgColor = computed(() => sideTheme.value === 'theme-light' ? variables.menuBackground : variables.menuLightBackground);
const textColor = computed(() => sideTheme.value === 'theme-light' ? variables.menuColor : variables.menuLightColor);
</script>

<style scoped>
.scrollbar-box{
  padding-left: 50px;
}
</style>
