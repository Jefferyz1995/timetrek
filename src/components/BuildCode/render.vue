<script setup name="Render">

const props = defineProps({
  formJson: {
    type: [String, Object],
    default: ""
  },
  formData: {
    type: [String, Object],
    default: ""
  },
  isView: {
    type: Boolean,
    default: false
  }
})

const vFormRef = ref(null)
// Get form data - asynchronous
const getFormData = () => {
  return vFormRef.value.getFormData()
}

/**
 * Set form content
 * @param {表单配置} formConf
 * formConfig：{ formTemplate: form template, formData: form data, hiddenField: field string collection that needs to be hidden, disabledField: self-reading string collection that needs to be disabled}
 */
const initForm = (formConf) => {
  const { formTemplate, formData, hiddenField, disabledField } = toRaw(formConf)
  if (formTemplate) {
    vFormRef.value.setFormJson(formTemplate)
    if (formData) {
      vFormRef.value.setFormData(formData)
    }
    if (disabledField && disabledField.length > 0) {
      setTimeout(() => {
        vFormRef.value.disableWidgets(disabledField)
      }, 200)
    }
    if (hiddenField && hiddenField.length > 0) {
      setTimeout(() => {
        vFormRef.value.hideWidgets(hiddenField)
      }, 200)
    }
    if (props.isView) {
      console.log(props.isView)
      setTimeout(() => {
        vFormRef.value.disableForm()
      }, 100)
    }
  }
}
defineExpose({ getFormData, initForm })
</script>

<template>
  <div class="">
    <v-form-render ref="vFormRef" :form-json="formJson" :form-data="formData" />
  </div>
</template>
