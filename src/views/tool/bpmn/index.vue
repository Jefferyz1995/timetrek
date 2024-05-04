<template>
  <div class="containerBox" style="position: relative;">
    <el-card>
      <div id="container" style="width: calc(100vw - 100px); height: calc(100vh - 100px)">
      </div>
      <div id="js-properties-panel"></div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
// 引入流程图
import { onMounted, markRaw } from 'vue';

// bpmn-js相关

import 'bpmn-js/dist/assets/diagram-js.css'; // 左边工具栏以及编辑节点的样式

import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

import BpmnModeler from 'bpmn-js/lib/Modeler';

// bpmn-js-properties-panel相关

import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'

import propertiesPanelModule from 'bpmn-js-properties-panel'

import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'



onMounted(() => {
  const containerEl = document.getElementById('container');
  const bpmnModeler = markRaw(new BpmnModeler({
    container: containerEl,
    // 添加控制板
    propertiesPanel: {
      parent: '#js-properties-panel'
    },
    // 右侧属性面板
    additionalModules: [
      propertiesPanelModule,
      propertiesProviderModule
    ],
  }));
  bpmnModeler.createDiagram(() => {
    bpmnModeler.get('canvas').zoom('fit-viewport');
  });
})
</script>
