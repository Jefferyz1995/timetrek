<template>
  <div class="register">
    <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
      <h3 class="title">TimeTrek Roster System</h3>
      <el-form-item :label="$t('tenantManager.companyName')" prop="companyName">
        <el-input v-model="registerForm.companyName" :placeholder="$t('tenantManager.companyName')" />
      </el-form-item>
      <el-form-item :label="$t('tenantManager.contactUserName')" prop="contactUserName">
        <el-input v-model="registerForm.contactUserName" :placeholder="$t('tenantManager.contactUserName')" />
      </el-form-item>
      <el-form-item :label="$t('tenantManager.contactPhone')" prop="contactPhone">
        <el-input v-model="registerForm.contactPhone" :placeholder="$t('tenantManager.contactPhone')" />
      </el-form-item>
      <el-form-item :label="$t('tenantManager.contactEmail')" prop="contactEmail">
        <el-input v-model="registerForm.contactEmail" :placeholder="$t('tenantManager.contactEmail')" />
      </el-form-item>
      <el-form-item v-if="!registerForm.id" :label="$t('tenantManager.username')" prop="username">
        <el-input v-model="registerForm.username" :placeholder="$t('tenantManager.username')" maxlength="30" />
      </el-form-item>
      <el-form-item v-if="!registerForm.id" :label="$t('tenantManager.password')" prop="password">
        <el-input type="password" v-model="registerForm.password" :placeholder="$t('tenantManager.password')" maxlength="20" />
      </el-form-item>
      <el-form-item :label="$t('tenantManager.accountCount')" prop="accountCount">
        <el-input v-model="registerForm.accountCount" :placeholder="$t('tenantManager.accountCount')" />
      </el-form-item>
      <el-form-item :label="$t('tenantManager.address')" prop="address">
        <el-input v-model="registerForm.address" :placeholder="$t('tenantManager.address')" />
      </el-form-item>
      <el-form-item :label="$t('tenantManager.companyNum')" prop="licenseNumber">
        <el-input v-model="registerForm.licenseNumber" :placeholder="$t('tenantManager.companyNum')" />
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button :loading="loading" size="large" type="primary" style="width:100%;" @click.prevent="handleRegister">
          <span v-if="!loading">Sign in</span>
          <span v-else>Sign in ing...</span>
        </el-button>
        <div style="float: right;">
          <router-link class="link-type" :to="'/login'">Log in with an existing account</router-link>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg, register, getTenantList } from '@/api/login';
import { RegisterForm, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import {TenantForm} from "@/api/system/tenant/types";

const router = useRouter();

const registerForm = ref<TenantForm>({
  id: undefined,
  tenantId: undefined,
  contactUserName: '',
  contactPhone: '',
  username: '',
  password: '',
  companyName: '',
  licenseNumber: '',
  domain: '',
  address: '',
  intro: '',
  remark: '',
  packageId: '',
  expireTime: '',
  accountCount: 0,
  status: '0',
});

// 租户开关
const tenantEnabled = ref(true);


const equalToPassword = (rule: any, value: string, callback: any) => {
  if (registerForm.value.password !== value) {
    callback(new Error("Password not match"));
  } else {
    callback();
  }
};

const registerRules: ElFormRules = {
  companyName: [
    { required: true, trigger: "blur", message: "Company Name Required" },
    { min: 2, max: 30, message: "Company name length must be between 2 and 30", trigger: "blur" }
  ],

  contactUserName: [
    { required: true, trigger: "blur", message: "Contact Person Required" },
    { min: 2, max: 10, message: "Person Name length must be between 2 and 10", trigger: "blur" }
  ],

  contactPhone: [
    { required: true, trigger: "blur", message: "Contact No. Required" },
    { min: 8, max: 10, message: "Contact No length must be between 8 and 10", trigger: "blur" }
  ],

  contactEmail: [
    { required: true, trigger: "blur", message: "Email is Required" },
    { min: 5, max: 10, message: "Email address length must be between 5 and 20", trigger: "blur" }
  ],

  username: [
    { required: true, trigger: "blur", message: "User ID Required" },
    { min: 2, max: 20, message: "User ID length must be between 2 and 20", trigger: "blur" }
  ],
  password: [
    { required: true, trigger: "blur", message: "Password Required" },
    { min: 5, max: 20, message: "Password length must be between 5 and 20", trigger: "blur" }
  ],
  accountCount: [
    { required: true, trigger: "blur", message: "Company Size Required" },
    { min: 5, max: 20, message: "Password length must be between 5 and 20", trigger: "blur" }
  ],
};
const codeUrl = ref("");
const loading = ref(false);
const captchaEnabled = ref(true);
const registerRef = ref<ElFormInstance>();
// 租户列表
const tenantList = ref<TenantVO[]>([]);

const handleRegister = () => {
  registerRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      const [err] = await to(register(registerForm.value));
      if (!err) {
        const username = registerForm.value.username;
        await ElMessageBox.alert("<font color='red'>Congrats " + username + " Registered Successfully</font>", "System Reminder", {
          dangerouslyUseHTMLString: true,
          type: "success",
        });
        window.location.href="http://ec2-13-212-13-238.ap-southeast-1.compute.amazonaws.com:8075/admin/login"
      } else {
        loading.value = false;
        if (captchaEnabled) {
          getCode();
        }
      }
    }
  });
}

const getCode = async () => {
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    registerForm.value.uuid = data.uuid;
  }
};

const initTenantList = async () => {
  const { data } = await getTenantList();
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      registerForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
}

onMounted(() => {
  // getCode();
  initTenantList();
})
</script>

<style lang="scss" scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: #041628;
}

.title {
  margin: 0 auto 30px auto;
  text-align: center;
  color: #707070;
}

.register-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;

  .el-input {
    height: 40px;

    input {
      height: 40px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0;
  }
}

.register-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.register-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial, serif;
  font-size: 12px;
  letter-spacing: 1px;
}

.register-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
