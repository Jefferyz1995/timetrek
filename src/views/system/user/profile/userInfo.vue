<template>
  <el-form ref="userRef" :model="userForm" :rules="rules" label-width="80px">
    <el-form-item :label="$t('userManager.nickName')">
      <el-input v-model="userForm.nickName" maxlength="30" />
    </el-form-item>
    <el-form-item :label="$t('userManager.phonenumber')" prop="phonenumber">
      <el-input v-model="userForm.phonenumber" maxlength="11" />
    </el-form-item>
    <el-form-item :label="$t('userManager.email')" prop="email">
      <el-input v-model="userForm.email" maxlength="50" />
    </el-form-item>
    <el-form-item :label="$t('userManager.sex')">
      <el-radio-group v-model="userForm.sex">
        <el-radio label="0">Male</el-radio>
        <el-radio label="1">Female</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">Submit</el-button>
      <el-button type="danger" @click="close">{{$t('commonBtn.close')}}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { updateUserProfile } from "@/api/system/user";

const props = defineProps({
  user: {
    type: Object as PropType<any>,
    required: true
  }
});
const userForm = computed(() => props.user);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const userRef = ref<ElFormInstance>();
const rules = ref<ElFormRules>({
  nickName: [{ required: true, message: "Name cannot be empty", trigger: "blur" }],
  email: [{ required: true, message: "Email cannot be empty", trigger: "blur" }, {
    type: "email",
    message: "Please enter the correct email",
    trigger: ["blur", "change"]
  }],

});


/** submit */
const submit = () => {
  userRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      await updateUserProfile(props.user);
      proxy?.$modal.msgSuccess("Success");
    }
  });
};
/** close */
const close = () => {
  proxy?.$tab.closePage();
};
</script>
