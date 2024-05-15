<template>
  <div class="login">
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">TimeTrek Roster System</h3>
      <el-form-item prop="tenantId" v-if="tenantEnabled">
        <el-select v-model="loginForm.tenantId" filterable placeholder="Please select/enter a company name" style="width: 100%">
          <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"></el-option>
          <template #prefix><svg-icon icon-class="company" class="el-input__icon input-icon" /></template>
        </el-select>
      </el-form-item>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" :placeholder="$t('userManager.userName')">
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" size="large" auto-complete="off" :placeholder="$t('userManager.password')" @keyup.enter="handleLogin">
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
<!--      <el-form-item prop="code" v-if="captchaEnabled">-->
<!--        <el-input v-model="loginForm.code" size="large" auto-complete="off" placeholder="验证码" style="width: 63%" @keyup.enter="handleLogin">-->
<!--          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>-->
<!--        </el-input>-->
<!--        <div class="login-code">-->
<!--          <img :src="codeUrl" @click="getCode" class="login-code-img" />-->
<!--        </div>-->
<!--      </el-form-item>-->
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">Remember Password</el-checkbox>
<!--      <el-form-item style="float: right;">-->
<!--        <el-button circle title="微信登录" @click="doSocialLogin('wechat')">-->
<!--          <svg-icon icon-class="wechat" />-->
<!--        </el-button>-->
<!--        <el-button circle title="MaxKey登录" @click="doSocialLogin('maxkey')">-->
<!--          <svg-icon icon-class="maxkey" />-->
<!--        </el-button>-->
<!--        <el-button circle title="Gitee登录" @click="doSocialLogin('gitee')">-->
<!--          <svg-icon icon-class="gitee" />-->
<!--        </el-button>-->
<!--        <el-button circle title="Github登录" @click="doSocialLogin('github')">-->
<!--          <svg-icon icon-class="github" />-->
<!--        </el-button>-->
<!--      </el-form-item>-->
      <el-form-item style="width:100%;">
        <el-button :loading="loading" size="large" type="primary" style="width:100%;" @click.prevent="handleLogin">
          <span v-if="!loading">Log in</span>
          <span v-else>Logging in</span>
        </el-button>
        <div style="float: right;" v-if="register">
          <router-link class="link-type" :to="'/register'">Sign up now</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
  </div>
</template>

<script setup lang="ts">
import { getCodeImg, getTenantList } from '@/api/login';
import { authBinding } from '@/api/system/social/auth';
import { useUserStore } from '@/store/modules/user';
import { LoginData, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import { HttpStatus } from "@/enums/RespEnum";

const userStore = useUserStore();
const router = useRouter();

const loginForm = ref<LoginData>({
  tenantId: '',
  username: '',
  password: '',
  rememberMe: false,
  code: '',
  uuid: ''
} as LoginData);

const loginRules: ElFormRules = {
  username: [{ required: true, trigger: 'blur', message: 'User ID Required' }],
  password: [{ required: true, trigger: 'blur', message: 'Password Required' }],
};

const codeUrl = ref('');
const loading = ref(false);

const captchaEnabled = ref(true);

const tenantEnabled = ref(true);



const register = ref(false);
const redirect = ref(undefined);
const loginRef = ref<ElFormInstance>();

const tenantList = ref<TenantVO[]>([]);

watch(() => router.currentRoute.value, (newRoute: any) => {
  redirect.value = newRoute.query && newRoute.query.redirect;
}, { immediate: true });

const handleLogin = () => {
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true;

      if (loginForm.value.rememberMe) {
        localStorage.setItem("tenantId", String(loginForm.value.tenantId));
        localStorage.setItem('username', String(loginForm.value.username));
        localStorage.setItem('password', String(loginForm.value.password));
        localStorage.setItem('rememberMe', String(loginForm.value.rememberMe));
      } else {

        localStorage.removeItem("tenantId");
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }

      const [err] = await to(userStore.login(loginForm.value));
      if (!err) {
        await router.push({ path: redirect.value || '/' });
        loading.value = false;
      } else {
        loading.value = false;

        if (captchaEnabled.value) {
          await getCode();
        }
      }
    } else {
      console.log('error submit!', fields);
    }
  });
};


const getCode = async () => {
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    loginForm.value.uuid = data.uuid;
  }
};

const getLoginData = () => {
  const tenantId = localStorage.getItem("tenantId");
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  const rememberMe = localStorage.getItem('rememberMe');
  loginForm.value = {
    tenantId: tenantId === null ? String(loginForm.value.tenantId) : tenantId,
    username: username === null ? String(loginForm.value.username) : username,
    password: password === null ? String(loginForm.value.password) : String(password),
    rememberMe: rememberMe === null ? false : Boolean(rememberMe)
  } as LoginData;
}



const initTenantList = async () => {
  const { data } = await getTenantList();
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      loginForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
}


watch(() => loginForm.value.tenantId, () => {
  localStorage.setItem("tenantId", String(loginForm.value.tenantId))
});

/**
 * 
 * @param type
 */
const doSocialLogin = (type: string) => {
  authBinding(type).then((res: any) => {
    if (res.code === HttpStatus.SUCCESS) {
      window.location.href = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
};



onMounted(() => {
  // getCode();
  initTenantList();
  getLoginData();
});
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  //background-image: url("../assets/images/login-background.jpg");
  //background-size: cover;
  background: #041628;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
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
    margin-left: 0px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-login-footer {
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

.login-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
