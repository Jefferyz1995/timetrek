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
// bpmn
import { onMounted, markRaw } from 'vue';

// bpmn-js

import 'bpmn-js/dist/assets/diagram-js.css'; 

import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

import BpmnModeler from 'bpmn-js/lib/Modeler';



import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'

import propertiesPanelModule from 'bpmn-js-properties-panel'

import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'



onMounted(() => {
  const containerEl = document.getElementById('container');
  const bpmnModeler = markRaw(new BpmnModeler({
    container: containerEl,
    // control panel
    propertiesPanel: {
      parent: '#js-properties-panel'
    },
    // property panel
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
