<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="Old Password" prop="oldPassword">
      <el-input v-model="user.oldPassword" placeholder="Old Password" type="password" show-password />
    </el-form-item>
    <el-form-item label="New Password" prop="newPassword">
      <el-input v-model="user.newPassword" placeholder="New Password" type="password" show-password />
    </el-form-item>
    <el-form-item label="Confirm New Password" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="Confirm New Password" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">Save</el-button>
      <el-button type="danger" @click="close">{{$t('commonBtn.close')}}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { updateUserPwd } from "@/api/system/user";
import type { ResetPwdForm } from "@/api/system/user/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const pwdRef = ref<ElFormInstance>();
const user = ref<ResetPwdForm>({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const equalToPassword = (rule: any, value: string, callback: any) => {
  if (user.value.newPassword !== value) {
    callback(new Error("Password not match"));
  } else {
    callback();
  }
};
const rules = ref({
  oldPassword: [{ required: true, message: "Old passowrd cannot be empty", trigger: "blur" }],
  newPassword: [{ required: true, message: "New password cannot be empty", trigger: "blur" }, {
    min: 6,
    max: 20,
    message: "6 to 20 characters in length",
    trigger: "blur"
  }],
  confirmPassword: [{ required: true, message: "Confirmed new password cannot be empty", trigger: "blur" }, {
    required: true,
    validator: equalToPassword,
    trigger: "blur"
  }]
});

/** submit */
const submit = () => {
  pwdRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      await updateUserPwd(user.value.oldPassword, user.value.newPassword);
      proxy?.$modal.msgSuccess("Success");
    }
  });
};
/** Close */
const close = () => {
  proxy?.$tab.closePage();
};
</script>
